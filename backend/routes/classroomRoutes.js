const express = require("express");
const Classroom = require("../models/Classroom");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");



// Create Classroom (Teacher Only)
router.post("/create-classroom", authMiddleware, async (req, res) => {
  try {
    if(!req.user)
        return res.status(401).json({message:"Unauthorized"});
    
    const requestedBy=await User.findById(req.user.id);
    if(!requestedBy)
        return res.status(401).json({message:"Unauthorized"});
    if(requestedBy.role!=='teacher') {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { classroomName, classCode, teacherId } = req.body;
    if (!classroomName) {
      return res.status(400).json({ message: "Classroom name is required" });
    }

    const classroom = new Classroom({
      classroomName,
      teacherId,
      students: [],
      classCode,
    });

    await classroom.save();
    res.status(201).json(classroom);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Classrooms for User (Both Students and Teachers)
router.get("/", authMiddleware, async (req, res) => {
    try {
        
        const user=await User.findById(req.user.id);
        
        const classrooms =
      user.role === "teacher"
        ? await Classroom.find({ teacherId: req.user.id })
        : await Classroom.find({ students: { $in: [req.user.id] } });
  
      res.json({ classrooms });
    } catch (error) {
        console.log("Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

// Join Classroom (Student Only)
router.post("/join-classroom/:classCode", authMiddleware, async (req, res) => {
  try {
    console.log("Join re1:",req.user)
    const requestedBy = await User.findById(req.user.id);
    console.log("Join re2:",requestedBy)
    if (requestedBy.role !== "student") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const classroom = await Classroom.findOne({ classCode: req.params.classCode });

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }
    

    if (!classroom.students.includes(req.user.id)) {
      classroom.students.push(req.user.id);
      await classroom.save();
    }

    res.json(classroom);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Classroom (Teacher Only)
router.delete("/delete-classroom/:id", authMiddleware, async (req, res) => {
  try {
    await console.log(req.params.id);
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    if (req.user.id.toString() !== classroom.teacherId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await classroom.deleteOne();
    res.json({ message: "Classroom deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/unenroll/:classroomId',authMiddleware, async (req, res) => {
  try {
    console.log("ClassRoom Id: ");
      const { classroomId } = req.params;
      const studentId = req.user.id; 
      console.log("Student ID:",studentId);
      await Classroom.findByIdAndUpdate(classroomId, {
          $pull: { students: studentId }
      });

      res.status(200).json({ message: "Successfully unenrolled" });
  } catch (error) {
    console.log("Error unenrolling from classroom:",error);
      res.status(500).json({ error: "Error unenrolling from classroom" });
  }
});

module.exports = router;
