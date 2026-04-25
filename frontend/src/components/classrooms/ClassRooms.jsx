import { useState, useEffect, useContext } from "react";
import { userLoginContext } from "../../contexts/userLoginContext";
import API from "../../api/axios";
import "../profile/Profile.css";
import "./ClassRooms.css"

function ClassRooms() {
  const { currentUser } = useContext(userLoginContext);

  const [showModal, setShowModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newClassroom, setNewClassroom] = useState({ classroomName: "" });

  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);

  const [classCode, setClassCode] = useState("");
  const [joinedClassrooms, setJoinedClassrooms] = useState([]);

  // Fetch classrooms automatically when user joins or unenrolls
  useEffect(() => {
    const getClassrooms = async () => {
      try {
        const response = await API.get("/classrooms", { withCredentials: true });
        
        setClassrooms(response.data.classrooms);
      } catch (error) {
        console.error("Error fetching classrooms:", error);
      }
    };

    getClassrooms();
  }, [joinedClassrooms, classrooms]); // Refetch when classrooms or joinedClassrooms change

  const isTeacher = currentUser.role === "teacher";
  const isStudent = currentUser.role === "student";

  function generateClassCode() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  // Handle Create Classroom (for teacher)
  async function handleCreateClassroom() {
    try {
      if (!newClassroom.classroomName.trim()) return;
      const uniqueClassCode = generateClassCode();
      const newClassroomData = {
        classroomName: newClassroom.classroomName,
        classCode: uniqueClassCode,
        students: [],
        teacherId: currentUser._id,
      };

      await API.post("/classrooms/create-classroom", newClassroomData, { withCredentials: true });

      setNewClassroom({ classroomName: "" });
      setShowModal(false);
    } catch (e) {
      console.error("Error creating classroom:", e);
    }
  }

  // Handle Join Classroom (for student)
  async function handleJoinClassroom() {
    try {
      if (!classCode.trim()) return;

      await API.post(`/classrooms/join-classroom/${classCode}`, { classCode }, { withCredentials: true });

      setClassCode("");
      setShowJoinModal(false);
    } catch (e) {
      console.error("Error joining classroom:", e);
    }
  }

  // Handle Unenroll (for student)
  async function handleUnenroll(classroomId) {
    try {
      await API.post(`/classrooms/unenroll/${classroomId}`, {}, { withCredentials: true });

      const updatedJoinedClassrooms = joinedClassrooms.filter((c) => c._id !== classroomId);
      setJoinedClassrooms(updatedJoinedClassrooms);

      console.log("Successfully unenrolled from the classroom");
    } catch (error) {
      console.error("Error occurred while unenrolling:", error);
    }
  }

  return (
    <div className="classrooms-container">
      {isStudent && (
        <>
          <div className="student-dashboard">
            <h2>Classrooms</h2>
            <div className="classroom-grid">
              {classrooms.length > 0 ? (
                classrooms.map((classroom, index) => (
                  <div key={index} className="classroom-container">
                    <div className="classroom-circle">
                      <img src="https://thumbs.dreamstime.com/b/e-learning-online-education-virtual-classroom-students-teacher-using-smart-interactive-whiteboard-concept-185213903.jpg" alt="" />
                    </div>
                    <div className="classroom-details">
                      <span className="classroom-subject">{classroom.classroomName}</span>
                      <button className="unenroll-button" onClick={() => handleUnenroll(classroom._id)}>
                        Unenroll
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No classrooms joined yet.</p>
              )}
              <div className="classroom-circle add-classroom" onClick={() => setShowJoinModal(true)}>
                <span className="plus-sign">+</span>
              </div>
            </div>
          </div>

          {showJoinModal && (
            <div className="modal">
              <div className="modal-content">
                <h3>Join Classroom</h3>
                <p>Ask your teacher for the class code, then enter it here.</p>
                <input type="text" placeholder="Class code" value={classCode} onChange={(e) => setClassCode(e.target.value)} />
                <button onClick={handleJoinClassroom}>Join</button>
                <button onClick={() => setShowJoinModal(false)}>Cancel</button>
              </div>
            </div>
          )}
        </>
      )}

      {isTeacher && (
        <>
          <div className="teacher-dashboard">
            <h2>Classrooms</h2>
            <div className="classroom-grid">
              {classrooms.length > 0 ? (
                classrooms.map((classroom) => (
                    <div key={classroom._id} className="classroom-container">
                    <div className="classroom-circle">
                      <img src="https://thumbs.dreamstime.com/b/e-learning-online-education-virtual-classroom-students-teacher-using-smart-interactive-whiteboard-concept-185213903.jpg" alt="Classroom" />
                      <button className="menu-button" onClick={() => setSelectedClassroom(classroom)}>⋮</button>
                    </div>
                    <div className="classroom-details">
                      <span className="classroom-subject">{classroom.classroomName}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p>No classrooms created yet.</p>
              )}
              <div className="classroom-circle add-classroom" onClick={() => setShowModal(true)}>
                <span className="plus-sign">+</span>
              </div>
            </div>
          </div>

          {selectedClassroom && (
            <div className="modal">
              <div className="modal-content">
                <h3>{selectedClassroom.classroomName}</h3>
                <p><strong>Members:</strong> {selectedClassroom.students.length + 1}</p>
                <p><strong>Join with Code:</strong> {selectedClassroom.classCode}</p>
                <button className="delete-button" onClick={() => handleDeleteClassroom(selectedClassroom)}>Delete Classroom</button>
                <button onClick={() => setSelectedClassroom(null)}>Close</button>
              </div>
            </div>
          )}

          {showModal && (
            <div className="modal">
              <div className="modal-content">
                <h3>Create Classroom</h3>
                <input type="text" placeholder="Enter Classroom Name" value={newClassroom.classroomName} onChange={(e) => setNewClassroom({ ...newClassroom, classroomName: e.target.value })} />
                <button onClick={handleCreateClassroom}>Create</button>
                <button onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ClassRooms;
