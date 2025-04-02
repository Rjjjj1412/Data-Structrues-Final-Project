import React, { useState, useEffect } from "react";
import { useNavigate} from "react-router-dom"; // Import NavLink
import { auth, db } from "../firebase";
import { doc, getDoc, collection, onSnapshot } from "firebase/firestore";
import "../styles/DoctorDashboard.css";
import EditProfile from "./EditProfile";
import CreateSchedule from "./CreateSchedule";
import DoctorAppointments from "./DoctorAppointments";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // Toggle for Edit Profile form
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false); // Toggle for Create Schedule form
  const [selectedNav, setSelectedNav] = useState("dashboard"); // Track active navigation
  const [doctorCount, setDoctorCount] = useState(0);
  const [patientCount, setPatientCount] = useState(0);
  const [newBookings, setNewBookings] = useState(0);
  const [todaySessions, setTodaySessions] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // Track loading state

  // Fetch doctor data
  useEffect(() => {
    const fetchDoctorData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDoctor(docSnap.data());
        }
      } else {
        navigate("/login"); // Redirect to login if no user is logged in
      }
      setIsLoading(false); // Set loading to false once doctor data is fetched
    };

    fetchDoctorData();
  }, [navigate]);

  // Listen for real-time updates for doctors count
  useEffect(() => {
    const unsubscribeDoctors = onSnapshot(collection(db, "users"), (snapshot) => {
      const doctorDocs = snapshot.docs.filter(doc => doc.data().role === 'doctor'); // Assuming a field 'role' for doctor
      setDoctorCount(doctorDocs.length);
    });

    return () => unsubscribeDoctors();
  }, []);

  // Listen for real-time updates for patients count
  useEffect(() => {
    const unsubscribePatients = onSnapshot(collection(db, "patients"), (snapshot) => {
      setPatientCount(snapshot.docs.length);
    });

    return () => unsubscribePatients();
  }, []);

  // Listen for real-time updates for new bookings
  useEffect(() => {
    const unsubscribeBookings = onSnapshot(collection(db, "bookings"), (snapshot) => {
      setNewBookings(snapshot.docs.filter(doc => doc.data().status === "new").length);
    });

    return () => unsubscribeBookings();
  }, []);

  // Listen for real-time updates for today's sessions
  useEffect(() => {
    const unsubscribeSessions = onSnapshot(collection(db, "sessions"), (snapshot) => {
      setTodaySessions(snapshot.docs.filter(doc => doc.data().date === new Date().toLocaleDateString()).length);
    });

    return () => unsubscribeSessions();
  }, []);

  // Logout function
  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  // Change selected menu item
  const handleNavClick = (menu) => {
    setSelectedNav(menu);
    if (menu === "dashboard") {
      setIsEditing(false); // Set isEditing to false when going to Dashboard
      setIsCreatingSchedule(false); // Set isCreatingSchedule to false when going to Dashboard
    } else if (menu === "editProfile") {
      setIsEditing(true); // Set isEditing to true when going to Edit Profile
      setIsCreatingSchedule(false); // Set isCreatingSchedule to false
    } else if (menu === "createSchedule") {
      setIsCreatingSchedule(true); // Set isCreatingSchedule to true when going to Create Schedule
      setIsEditing(false); // Set isEditing to false
    } else if (menu === "appointments") {
      setIsEditing(false);
      setIsCreatingSchedule(false);
    }
  };

  if (isLoading) {
    return <div>Loading doctor data...</div>; // Display loading message if doctor data is still being fetched
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="profile">
          {/* Use default profile picture if no profilePic */}
          <img
            src={doctor?.profilePic || "/default-profile.png"} // Default image if no profile pic
            alt="Profile"
            className="profile-pic"
          />
          <h3>{doctor?.name || "Test Doctor"}</h3>
          <p>{doctor?.email || "doctor@edoc.com"}</p>
        </div>
        <button className="btn btn-danger" onClick={handleLogout}>
          Log out
        </button>
        <nav className="menu">
          <button
            className={`nav-link ${selectedNav === "dashboard" ? "active" : ""}`}
            onClick={() => handleNavClick("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`nav-link ${selectedNav === "editProfile" ? "active" : ""}`}
            onClick={() => handleNavClick("editProfile")}
          >
            Edit Profile
          </button>
          <button
            className={`nav-link ${selectedNav === "createSchedule" ? "active" : ""}`}
            onClick={() => handleNavClick("createSchedule")}
          >
            Create Schedule
          </button>
          <button
            className={`nav-link ${selectedNav === "appointments" ? "active" : ""}`}
            onClick={() => handleNavClick("appointments")}
          >
            Appointments
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {isEditing ? (
          <EditProfile
            doctor={doctor}
            setDoctor={setDoctor}
            setIsEditing={setIsEditing}
          />
        ) : isCreatingSchedule ? (
          <CreateSchedule doctor={doctor} />
        ) : selectedNav === "appointments" ? (
          <DoctorAppointments doctor={doctor} />
        ) : (
          <>
            {/* Welcome Section */}
            <section className="welcome-section">
              <h2>
                Welcome! <strong>{doctor?.name || "Test Doctor"}</strong>
              </h2>
              <p>Manage your schedule and patient appointments efficiently.</p>
              <button
                className="btn primary-btn"
                onClick={() => handleNavClick("appointments")}
              >
                View My Appointments
              </button>
            </section>

            {/* Status Overview */}
            <section className="status-section">
              <div className="status-card">
                <h3>{doctorCount}</h3>
                <p>All Doctors</p>
              </div>
              <div className="status-card">
                <h3>{patientCount}</h3>
                <p>All Patients</p>
              </div>
              <div className="status-card">
                <h3>{newBookings}</h3>
                <p>New Bookings</p>
              </div>
              <div className="status-card">
                <h3>{todaySessions}</h3>
                <p>Today's Sessions</p>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default DoctorDashboard;

