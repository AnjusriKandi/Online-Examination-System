const mongoose = require("mongoose");

const ClassroomSchema = new mongoose.Schema({
  classroomName: { type: String, required: true },
  classCode: { type: String, required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  
});

module.exports = mongoose.model("Classroom", ClassroomSchema);
