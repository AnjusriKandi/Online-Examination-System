const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to teacher
  education: { type: String, required: true },
  classLevel: { type: String, required: true },
  subject: { type: String, required: true },
  testPaperName: { type: String, required: true },
  numQuestions: { type: Number, required: true },
  timeAllowed: { type: Number, required: true },
  generalInstructions: { type: String },
  examType: { type: String, enum: ["question-paper", "online-test"], required: true },
  examLink: { type: String, default: "" },
  questions: { type: Array, default: [] },
  classroom: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom" },
}, { timestamps: true });

const Exam = mongoose.model("Exam", examSchema);
module.exports = Exam;
