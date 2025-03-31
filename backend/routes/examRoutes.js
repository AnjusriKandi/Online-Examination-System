const express = require("express");
const Exam = require("../models/Exam");
const authMiddleware = require("../middleware/authMiddleware");
const { v4: uuidv4 } = require("uuid");
const Submission = require("../models/Submission");
const router = express.Router();
const mongoose = require("mongoose");
const Classroom=require("../models/Classroom");


// Create a new exam
router.post("/create", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { education, classLevel, subject, testPaperName, numQuestions, timeAllowed, generalInstructions, examType, questions } = req.body;

    let examLink = "";
    if (examType === "online-test") {
      examLink = `http://localhost:5173/dashboard/exam/${uuidv4()}`;
    }

    const newExam = new Exam({
      createdBy: req.user.id,
      education,
      classLevel,
      subject,
      testPaperName,
      numQuestions,
      timeAllowed,
      generalInstructions,
      examType,
      examLink,
      questions,
    });

    await newExam.save();
    res.status(201).json({ message: "Exam created successfully!", exam: newExam });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
});

// Get all exams created by the logged-in teacher
router.get("/teacher-get-exams", authMiddleware, async (req, res) => {
  try {
    
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const exams = await Exam.find({ createdBy: req.user.id });
    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

//get a particular exam data
router.get("/get-exam/:examId", async (req, res) => {
  try {
    console.log("ExamId: ",req.params.examId);
    const exam = await Exam.findOne({ examLink: `http://localhost:5173/dashboard/exam/${req.params.examId }`});
    console.log("Exam: ",exam);
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: "Error fetching exam" });
  }
});

// Handle exam submission
router.post("/submit-exam", authMiddleware, async (req, res) => {
  try {
    const { exId, responses, score, submissionTime } = req.body;
    const userId = req.user.id; // From authentication middleware
    console.log("Exam ID before submission:", exId);

    // Validate required fields
    if (!exId || !responses || score === undefined) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Ensure examId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(exId)) {
      return res.status(400).json({ message: "Invalid exam ID format." });
    }

    // Convert examId to ObjectId
    const examObjectId = new mongoose.Types.ObjectId(exId);

    // Check if the exam exists
    const exam = await Exam.findById(examObjectId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found." });
    }

    // Check if the user has already submitted this exam
    const existingSubmission = await Submission.findOne({ examId: examObjectId, userId });
    if (existingSubmission) {
      return res.status(400).json({ message: "You have already submitted this exam." });
    }

    console.log("Existing Submission:", existingSubmission);

    // Create a new submission entry
    const newSubmission = new Submission({
      userId,
      examId: examObjectId,
      responses,
      score,
      submissionTime,
    });

    console.log("New Submission:", newSubmission);
    await newSubmission.save();

    res.status(200).json({ message: "Exam submitted successfully!", score });
  } catch (error) {
    console.error("Error submitting exam:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Fetch exam results for a user
router.get("/results/:examId", authMiddleware, async (req, res) => {
  try {
    const { examId } = req.params;
    const userId = req.user.id; // Get user ID from authentication middleware

    // Validate examId format
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({ message: "Invalid exam ID format." });
    }

    // Find user's submission for the given exam
    const submission = await Submission.findOne({ examId, userId })
      .populate("examId", "title totalMarks"); // Fetch exam metadata

    if (!submission) {
      return res.status(404).json({ message: "No results found for this exam." });
    }

    // Respond with submission details
    res.status(200).json({
      examTitle: submission.examId.title,
      totalMarks: submission.examId.totalMarks,
      score: submission.score,
      submissionTime: submission.submissionTime,
      responses: submission.responses, // Contains user's answers & correctness
    });
  } catch (error) {
    console.error("Error fetching exam results:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Get test performance data for a student
router.get("/tests-performance", authMiddleware, async (req, res) => {
  try {
      const userId = req.user.id; // Get user ID from auth middleware

      // Fetch all submissions for the logged-in student
      const submissions = await Submission.find({ userId });

      if (!submissions.length) {
          return res.status(404).json({ message: "No test performance data found." });
      }

      // Map the relevant test data
      const performanceData = submissions.map(submission => ({
          examId: submission.examId,
          score: submission.score,
          totalMarks:submission.totalMarks,
      }));
      console.log("Performance Data: ",performanceData);

      res.status(200).json(performanceData);
  } catch (error) {
      console.error("Error fetching test performance:", error);
      res.status(500).json({ message: "Server error fetching test performance data." });
  }
});


// POST exam to a group
router.post("/post-to-group", async (req, res) => {
  try {
    const { examId, groupId, postedBy } = req.body;
    
    // Find the exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }



    // Associate the exam with the group
    exam.classroom = groupId;
    await exam.save();

    res.status(200).json({ message: "Exam posted to group successfully", exam });
  } catch (error) {
    console.error("Error posting exam to group:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/student-get-exams",authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("User: ",userId)
    // Find classrooms the student is part of
    const classrooms=await Classroom.find({ students: { $in: [req.user.id] } }).select("_id");

    // Extract classroom IDs
    const classroomIds = classrooms.map((classroom) => classroom._id);

    // Find exams assigned to these classrooms
    const exams = await Exam.find({ classroom: { $in: classroomIds } });

    res.status(200).json(exams);
  } catch (error) {
    console.error("Error fetching exams for students:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


module.exports = router;
