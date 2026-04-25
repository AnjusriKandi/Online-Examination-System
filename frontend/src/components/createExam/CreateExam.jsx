import { useState,useContext } from "react";
import QuestionTypes from "../questions/QuestionTypes";
import { v4 as uuidv4 } from "uuid";
import "../exams/Exams.css";
import API from "../../api/axios";
import { userLoginContext } from "../../contexts/userLoginContext";


function CreateExam({ onExamCreated }) {

  const { currentUser } = useContext(userLoginContext);
  const [step, setStep] = useState(1);
  const [education, setEducation] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [testPaperName, setTestPaperName] = useState("");
  const [numQuestions, setNumQuestions] = useState("");
  const [timeAllowed, setTimeAllowed] = useState("");
  const [generalInstructions, setGeneralInstructions] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [warning, setWarning] = useState("");
  const [examType, setExamType] = useState("");
  const [showExamTypePopup, setShowExamTypePopup] = useState(false);
  


  // Save questions from QuestionTypes component
  const handleSaveQuestion = (newQuestion) => {
    setSavedQuestions([...savedQuestions, newQuestion]);
  };

  // Publish the exam after adding questions
  const handlePublishExam = (questions) => {
    setSavedQuestions(questions);
    setStep(3);
  };

  // Validate Step 1 Before Proceeding
  const handleNextStep = () => {
    if (!education || !subject || !testPaperName || !numQuestions || !timeAllowed || !termsAccepted) {
      setWarning("Please fill in all fields and accept the Terms of Use.");
    } else {
      setWarning("");
      setStep(2);
    }
  };

  // Submit Exam and Send Data Back to Exams.jsx
  const handleSubmitExam = async () => {
      try {
        let examLink = "";
  
        if (examType === "online-test") {
          // Generate a unique exam link
          examLink = `${window.location.origin}/dashboard/exam/${uuidv4()}`;
        }
  
        const examData = {
          createdBy: currentUser?.id,
          education,
          classLevel,
          subject,
          testPaperName,
          numQuestions,
          timeAllowed,
          generalInstructions,
          examType,
          questions: savedQuestions,
        };
  
        const res = await API.post("/exams/create", examData, {
          withCredentials: true,
        });
  
        if (res.status === 201) {
          if (examType === "question-paper") {
            generatePDF(savedQuestions, testPaperName);
          } else {
            alert(`Exam created successfully! Exam link: ${examLink}`);
          }
  
          setStep(0); // Reset to home after submission
        }
      } catch (error) {
        console.error(error);
        alert("Failed to create exam. Please try again.");
      }


    onExamCreated(examData);
  };

  return (
    <div className="create-exam-container">
      {step > 0 && (
        <div className="create-exam">
          <h2>Create a New Test</h2>

          <div className="steps">
            <div className={step === 1 ? "active" : ""}>1. Exam Details</div>
            <div className={step === 2 ? "active" : ""}>2. Add Questions</div>
            <div className={step === 3 ? "active" : ""}>3. Preview & Submit</div>
          </div>

          {/* Step 1: Exam Setup */}
          {step === 1 && (
            <div className="exam-form">
              <label>Education</label>
              <select value={education} onChange={(e) => setEducation(e.target.value)}>
                <option value="">Select Education</option>
                <option value="School">School</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Engineering">Engineering</option>
                <option value="Others">Others</option>
              </select>

              <label>Class</label>
              <input
                type="text"
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                placeholder="Enter Class"
              />

              <label>Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter Subject"
              />

<div className="test-paper-label">
                <span>
                  Test Paper Type
                  <button
                    className="info-btn"
                    onClick={() => setShowExamTypePopup(true)}
                  >
                    What is this?
                  </button>
                </span>
              </div>

              {showExamTypePopup && (
                <div className="popup-overlay">
                  <div className="popup-content">
                    <h3>Test Paper Type Information</h3>
                    <p>
                      <strong>Question Paper (PDF):</strong> This is a normal
                      question paper in PDF format. You will also get a separate
                      solution PDF. Best suitable for offline exams.
                    </p>
                    <p>
                      <strong>Online Test (Link):</strong> This is an online
                      test with only objective questions such as MCQ, T/F,
                      Fill-ups and One-word answers. Here, the result will be
                      automatically generated.
                    </p>
                    <button
                      className="close-btn"
                      onClick={() => setShowExamTypePopup(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    value="question-paper"
                    checked={examType === "question-paper"}
                    onChange={() => setExamType("question-paper")}
                  />
                  Question Paper (PDF)
                </label>
                <label>
                  <input
                    type="radio"
                    value="online-test"
                    checked={examType === "online-test"}
                    onChange={() => setExamType("online-test")}
                  />
                  Online Test (Link)
                </label>
              </div>

              <label>Test Paper Name</label>
              <input
                type="text"
                value={testPaperName}
                onChange={(e) => setTestPaperName(e.target.value)}
                placeholder="Enter Test Paper Name"
              />

              <label>Number of Questions</label>
              <input
                type="number"
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                placeholder="Enter number of questions"
              />

              <label>Time Allowed (minutes)</label>
              <input
                type="number"
                value={timeAllowed}
                onChange={(e) => setTimeAllowed(e.target.value)}
                placeholder="Enter time in minutes"
              />

              <label>General Instructions</label>
              <textarea
                value={generalInstructions}
                onChange={(e) => setGeneralInstructions(e.target.value)}
                placeholder="Enter instructions..."
                rows="3"
              ></textarea>

              <div className="terms-container">
                <input type="checkbox" checked={termsAccepted} onChange={() => setTermsAccepted(!termsAccepted)} />
                <span>I agree to the Terms of Use</span>
              </div>

              {warning && <p className="warning">{warning}</p>}

              <button className="next-btn" onClick={handleNextStep}>Next</button>
            </div>
          )}

          {/* Step 2: Add Questions */}
          {step === 2 && (
            <QuestionTypes onSaveQuestion={handleSaveQuestion} onPublish={handlePublishExam} />
          )}

          {/* Step 3: Preview & Submit */}
          {step === 3 && (
            <div className="preview-container">
              <h3>Preview Your Test</h3>

              <div className="exam-preview">
                <h4>Exam Details</h4>
                <p><strong>Education:</strong> {education}</p>
                <p><strong>Class:</strong> {classLevel}</p>
                <p><strong>Subject:</strong> {subject}</p>
                <p><strong>Test Paper Name:</strong> {testPaperName}</p>
                <p><strong>Number of Questions:</strong> {numQuestions}</p>
                <p><strong>Time Allowed:</strong> {timeAllowed} minutes</p>
                <p><strong>Instructions:</strong> {generalInstructions || "No instructions provided"}</p>
              </div>

              <div className="questions-preview">
                <h4>Preview Questions</h4>
                {savedQuestions.length === 0 ? (
                  <p>No questions added yet.</p>
                ) : (
                  <ul>
                    {savedQuestions.map((q, index) => (
                      <li key={index}>
                        <strong>Q{index + 1}:</strong> {q.question}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button onClick={handleSubmitExam} className="create-exam-submit-btn">Create Exam</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CreateExam;
