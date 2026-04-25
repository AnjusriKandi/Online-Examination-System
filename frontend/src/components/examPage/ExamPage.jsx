import "./ExamPage.css";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import API from "../../api/axios";
import * as faceapi from "face-api.js";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";

function ExamPage() {
  const navigate = useNavigate();
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerStarted, setTimerStarted] = useState(false);
  const [faceDetected, setFaceDetected] = useState(true);
  const [faceWarning, setFaceWarning] = useState("");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceMissCount, setFaceMissCount] = useState(0);
  const [cameraAllowed, setCameraAllowed] = useState(true);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [userResponses, setUserResponses] = useState({});
  const [examResult, setExamResult] = useState(null);
  const [examStarted, setExamStarted] = useState(false);
  const [exId, setExId] = useState();
  const webcamRef = useRef(null);

  //Checks camera permission
  const checkCameraPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraAllowed(true);
    } catch (error) {
      setCameraAllowed(false);
      setShowCameraModal(true);

      // Auto-submit exam after 30 seconds if camera is not enabled
      setTimeout(() => {
        if (!cameraAllowed) {
          alert("Camera access denied. Your exam is being submitted.");
          handleSubmitExam();
        }
      }, 30000);
    }
  };
  useEffect(() => {
    checkCameraPermission();
  }, []);

  //Loads face api models
  const loadFaceAPImodels = async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      setModelsLoaded(true);
      console.log("Face API models loaded.");
    } catch (error) {
      console.error("Error loading Face API models:", error);
    }
  };

  //Detects face
  const detectFace = useCallback(async () => {
    if (!webcamRef.current || !modelsLoaded) return;

    const video = webcamRef.current.video;
    if (!video) return;

    try {
      const detections = await faceapi.detectAllFaces(
        video,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 128,
          scoreThreshold: 0.4,
        }) // Adjusted options
      );

      if (detections.length > 0) {
        setFaceDetected(true);
        setFaceWarning("");
        setFaceMissCount(0);
      } else {
        setFaceDetected(false);
        setFaceWarning(
          "⚠️ No face detected! Please stay in front of the camera."
        );
        setTimeout(() => setFaceMissCount((prev) => prev + 1), 3000); // Delay increasing count
      }
    } catch (error) {
      console.error("Face detection error:", error);
    }
  }, [modelsLoaded]);

  // Detects face continuously
  useEffect(() => {
    let animationFrameId;
    const detectContinuously = async () => {
      await detectFace();
      animationFrameId = requestAnimationFrame(detectContinuously);
    };

    if (modelsLoaded && timerStarted) {
      detectContinuously();
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [modelsLoaded, timerStarted, detectFace]);

  //Face Detection failed
  useEffect(() => {
    if (faceMissCount >= 5) {
      alert("Too many face detection failures! Exam will be submitted.");
      handleSubmitExam();
    }
  }, [faceMissCount]);

  //Loads exam
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await API.get(`/exams/get-exam/${examId}`);
        console.log(res.data);
        setExam(res.data);
        setExId(res.data._id);
        setTimeLeft(res.data.timeAllowed * 60);
      } catch (error) {
        console.error("Failed to load exam:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId]);

  //Timer
  useEffect(() => {
    if (!timerStarted || timeLeft === null) return;
    if (timeLeft <= 0) {
      handleSubmitExam();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, timerStarted]);

  //Handles user responses
  const handleResponseChange = (questionId, answer) => {
    setUserResponses((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
    console.log("User Responses: ", userResponses);
  };

  // Function to calculate score
  const calculateScore = (exam, userResponses) => {
    let score = 0;

    exam.questions.forEach((question) => {
      console.log("Question ID:", question.id);
      console.log("Correct Answers:", question.correctAnswers);
      console.log("User Response:", userResponses[question.id]);

      // Ensure correctAnswers exists and is an array
      if (
        Array.isArray(question.correctAnswers) &&
        question.correctAnswers.includes(userResponses[question.id])
      ) {
        score += parseInt(question.marks) || 1; // Convert marks to number, default to 1 if missing
      }
    });

    return score;
  };

  //Handles exam submission
  const handleSubmitExam = async () => {
    if (!exam) return;

    //calculate score
    const score = calculateScore(exam, userResponses);
    console.log("Score", score);

    const submissionData = {
      exId,
      responses: userResponses,
      score,
      submissionTime: new Date().toISOString(),
    };
    
    console.log("Submission data:", submissionData);
    try {
      const response = await API.post("/exams/submit-exam", submissionData, {
        withCredentials: true,
      });

      if (response.status === 200) {
        alert("Exam submitted successfully!");
        setExamStarted(false); // Mark the exam as ended
        setTimerStarted(false); // Stop the timer
        setCameraAllowed(false); // Stop the camera
        setFaceDetected(true); // Reset face detection status
        setTimeLeft(null); // Clear remaining time
        navigate(`/dashboard/results/${exId}`);
      } else {
        alert("Failed to submit exam. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      alert("An error occurred while submitting your exam.");
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleUserMedia = () => {
    console.log("Camera is now playing!");
    setTimerStarted(true);

    setTimeout(() => {
      loadFaceAPImodels(); // Load models after 1 second delay
    }, 1000);
  };

   // Fullscreen Mode Toggle (Modified to target only exam container)
   const toggleFullscreen = () => {
    const elem = document.querySelector(".exam-container");
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  };

  // Handle Start Exam Button
  const handleStartExam = () => {
    setExamStarted(true);
    toggleFullscreen();
  };

   // Prevent Escape, Tab, and Refresh actions during exam
   useEffect(() => {
    const preventActions = (e) => {
      if (examStarted) {
        const forbiddenKeys = ["Escape", "Tab", "F5", "F11"];
  
        if (forbiddenKeys.includes(e.key) || (e.ctrlKey && e.key === "Tab")) {
          e.preventDefault();
          alert("⚠ You cannot exit or refresh the exam once it has started.");
          handleSubmitExam();
        }
      }
    };
  
    const handleVisibilityChange = () => {
      if (document.hidden && examStarted) {
        alert("⚠ You switched tabs! Your exam is being submitted.");
        handleSubmitExam();
      }
    };
  
    document.addEventListener("keydown", preventActions);
    document.addEventListener("visibilitychange", handleVisibilityChange);
  
    return () => {
      document.removeEventListener("keydown", preventActions);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [examStarted]);
  

  if (loading) return <p>Loading exam...</p>;
  if (!exam) return <p>Exam not found.</p>;

  return (
    <div className={`exam-container ${examStarted ? "fullscreen" : ""}`}>
      {!examStarted && (
        <div>
          <button onClick={handleStartExam}>Take Exam</button>
        </div>
      )}
      {examStarted && (
        <>
      <h1>{exam.testPaperName}</h1>
      <p>
        <strong>Subject:</strong> {exam.subject}
      </p>
      <p>
        <strong>Time Allowed:</strong> {exam.timeAllowed} minutes
      </p>

      <div className="camera-container">
        <Webcam
          audio={false}
          ref={webcamRef}
          onUserMedia={handleUserMedia}
          onUserMediaError={(err) => console.error("Camera error:", err)}
        />
      </div>
      {timerStarted && <h2>Time Left: {formatTime(timeLeft)}</h2>}
      {!faceDetected ? (
        <p>{faceWarning}</p>
      ) : (
        <>
          {exam.questions.map((q, index) => (
            <div key={q.id} className="questionEP">
              <p>
                <strong>Q{index + 1}:</strong> {q.question}
              </p>
              {q.options?.map((opt, i) => (
                <label key={i}>
                  <input
                    type="radio"
                    name={`q${index}`}
                    value={opt}
                    checked={userResponses[q.id] === i}
                    onChange={() => handleResponseChange(q.id, i)}
                  />{" "}
                  {opt}
                </label>
              ))}
            </div>
          ))}
          <button onClick={handleSubmitExam}>Submit Exam</button>
        </>
      )}

      {showCameraModal && (
        <div className="camera-warning-modal">
          <div className="camera-warning-modal-content">
            <h2>Camera Access Required</h2>
            <h3 color="red">WARNING!!!</h3>
            <p>
              Please enable your camera to continue the exam. If you do not
              enable it within 30 seconds, your exam will be submitted.
            </p>
            <button
              onClick={() => {
                setShowCameraModal(false);
                checkCameraPermission();
              }}
            >
              Try Again
            </button>
          </div>
        </div>
        
      )}
      </>
    )}
    </div>
  );
}

export default ExamPage;
