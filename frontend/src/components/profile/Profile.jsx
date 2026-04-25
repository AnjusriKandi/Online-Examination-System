<<<<<<< HEAD
import { useContext, useState, useEffect } from "react";
import { userLoginContext } from "../../contexts/userLoginContext";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import "./Profile.css";
import API from "../../api/axios";

function Profile() {
  const { currentUser } = useContext(userLoginContext);
  const [showModal, setShowModal] = useState(false);
  const [newClassroom, setNewClassroom] = useState({ subject: "" });
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadClassrooms() {
      try {
        const res = await API.get("/profile/classrooms");
        setClassrooms(res.data);
      } catch (error) {
        console.error("Error fetching classrooms:", error);
      }
    }
    loadClassrooms();
  }, []);

  if (!currentUser) return <p>Loading...</p>;

  const isTeacher = currentUser.role === "teacher";
  const isStudent = currentUser.role === "student";

  // Dummy recent test data for students
  const recentTests = currentUser.recentTests || [];

  // Categorizing test scores
  const categories = { "<40%": 0, "40-70%": 0, ">70%": 0 };
  recentTests.forEach((test) => {
    if (test.score < 40) categories["<40%"]++;
    else if (test.score < 70) categories["40-70%"]++;
    else categories[">70%"]++;
  });

  // Pie chart data
  const pieData = [
    { name: "<40%", value: categories["<40%"], color: "#ff4d4d" },
    { name: "40-70%", value: categories["40-70%"], color: "#ffc107" },
    { name: ">70%", value: categories[">70%"], color: "#28a745" },
  ];

  // Handle Create Classroom (for teacher)
  function handleCreateClassroom() {
    if (!newClassroom.subject.trim()) return;

    const classroomId = Date.now();
    const classroomLink = `/join-classroom/${classroomId}`;
    const updatedClassrooms = [
      ...classrooms,
      { id: classroomId, subject: newClassroom.subject, members: [], link: classroomLink, messages: [] },
    ];

    setClassrooms(updatedClassrooms);
    localStorage.setItem("classrooms", JSON.stringify(updatedClassrooms));
    setNewClassroom({ subject: "" });
    setShowModal(false);
  }

  // Handle Delete Classroom (for teacher)
  function handleDeleteClassroom(classroom) {
    const updatedClassrooms = classrooms.filter((c) => c.id !== classroom.id);
    setClassrooms(updatedClassrooms);
    localStorage.setItem("classrooms", JSON.stringify(updatedClassrooms));
    setSelectedClassroom(null);
  }

  // Handle Send Message
  function handleSendMessage() {
    if (!message.trim()) return;

    const updatedClassrooms = classrooms.map((c) =>
      c.id === selectedClassroom.id ? { ...c, messages: [...c.messages, message] } : c
    );

    setClassrooms(updatedClassrooms);
    localStorage.setItem("classrooms", JSON.stringify(updatedClassrooms));
    setMessage("");
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Info */}
        <div className="profile-info">
          <h1>Profile</h1>
          <p><strong>Username:</strong> {currentUser.username}</p>
          <p><strong>Email:</strong> {currentUser.email}</p>
          <p><strong>Role:</strong> {currentUser.role}</p>
          <p><strong>Workplace:</strong> {currentUser.workPlace}</p>
          <p><strong>Purpose:</strong> {currentUser.purpose}</p>
        </div>

        {/* Profile Image */}
        <div className="profile-image">
        <img src={currentUser.photo} alt={`${currentUser.username}'s profile`} />
        </div>
      </div>

      {/* Conditional Rendering based on Role */}

      {/* Student Dashboard */}
      {isStudent && (
        <>
          <div className="profile-chart">
            <h2>Test Performance</h2>
            {recentTests.length > 0 ? (
              <PieChart width={300} height={300}>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            ) : (
              <p>No test data available for performance chart.</p>
            )}
          </div>
          
        </>
      )}

      {/* Teacher Dashboard */}
      {isTeacher && (
        <>
          <div className="teacher-dashboard">
            <h2>Your Classrooms</h2>
            <div className="classroom-grid">
              {classrooms.length > 0 ? (
                classrooms.map((classroom) => (
                  <div key={classroom.id} className="classroom-circle">
                    <span className="classroom-subject">{classroom.subject}</span>
                    <button className="menu-button" onClick={() => setSelectedClassroom(classroom)}>⋮</button>
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

          {/* Classroom Modal for Teacher */}
          {selectedClassroom && (
            <div className="modal">
              <div className="modal-content">
                <h3>{selectedClassroom.subject}</h3>
                <p><strong>Members:</strong> {selectedClassroom.members.length}</p>
                <p>
                  <strong>Join Link:</strong> 
                  <a href={selectedClassroom.link} target="_blank" rel="noopener noreferrer">
                    {window.location.origin + selectedClassroom.link}
                  </a>
                </p>
                <h4>Send Message</h4>
                <textarea
                  rows="3"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
                <button className="send-button" onClick={handleSendMessage}>Send</button>
                <button className="delete-button" onClick={() => handleDeleteClassroom(selectedClassroom)}>
                  Delete Classroom
                </button>
                <button onClick={() => setSelectedClassroom(null)}>Close</button>
              </div>
            </div>
          )}

          {/* Create Classroom Modal */}
          {showModal && (
            <div className="modal">
              <div className="modal-content">
                <h3>Create Classroom</h3>
                <input
                  type="text"
                  placeholder="Enter Classroom Name"
                  value={newClassroom.subject}
                  onChange={(e) => setNewClassroom({ ...newClassroom, subject: e.target.value })}
                />
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

export default Profile;
=======
import { useContext, useState, useEffect } from "react";
import { userLoginContext } from "../../contexts/userLoginContext";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import "./Profile.css";
import API from "../../api/axios";
import ClassRooms from "../classrooms/ClassRooms";

function Profile() {
  const { currentUser } = useContext(userLoginContext);
  const [testData, setTestData] = useState([]);

  useEffect(() => {
    async function loadTestPerformance() {
      try {
        const res = await API.get("/exams/tests-performance", {
          withCredentials: true,
        });
        console.log(res.data);
        setTestData(res.data);
      } catch (error) {
        console.error("Error fetching test data:", error);
      }
    }
    loadTestPerformance();
  }, []);

  if (!currentUser) return <p>Loading...</p>;

  const isStudent = currentUser.role === "student";

  // Ensure testData is valid and contains scores
  const categories = { "<40%": 0, "40-70%": 0, ">70%": 0 };
  testData.forEach((test) => {
    const ts=test.score/20*100;
    if (ts < 40) categories["<40%"]++;
    else if (ts < 70) categories["40-70%"]++;
    else categories[">70%"]++;
  });

  // Generate Pie Chart Data
  const pieData = [
    { name: "<40%", value: categories["<40%"], color: "#ff4d4d" },
    { name: "40-70%", value: categories["40-70%"], color: "#ffc107" },
    { name: ">70%", value: categories[">70%"], color: "#28a745" },
  ].filter((entry) => entry.value > 0); // Remove zero values to avoid empty chart

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Info */}
        <div className="profile-info">
          <h1>Profile</h1>
          <p>
            <strong>Username:</strong> {currentUser.username}
          </p>
          <p>
            <strong>Email:</strong> {currentUser.email}
          </p>
          <p>
            <strong>Role:</strong> {currentUser.role}
          </p>
          <p>
            <strong>Workplace:</strong> {currentUser.workPlace}
          </p>
        </div>

        {/* Profile Image */}
        <div className="profile-image">
          <img src={currentUser.photo} alt={`${currentUser.username}'s profile`} />
        </div>
      </div>

      <ClassRooms />

      {/* Student Dashboard */}
      {isStudent && (
        <div className="profile-chart">
          <h2>Test Performance</h2>
          {pieData.length > 0 ? (
            <PieChart className="chart" width={300} height={300}>
              <Pie
                data={pieData}
                cx={150}
                cy={150}
                outerRadius={100}
                dataKey="value"
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          ) : (
            <p>No test data available for performance chart.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Profile;
>>>>>>> fd4dc0de8298dc333c658743bedd5ce969a35c98
