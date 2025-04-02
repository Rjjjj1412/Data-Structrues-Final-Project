import React, { useState, useEffect } from "react";
import { useNavigate} from "react-router-dom"; // Import Link from react-router-dom
import { auth, db } from "../firebase";
import { doc, getDoc, collection, onSnapshot } from "firebase/firestore";
import "../styles/PatientDashboard.css";
import PEditProfile from "./PEditProfile"; // Import PEditProfile component
import AppointmentRequest from "./AppointmentRequest"; // Component to request appointment
import MyAppointment from "./MyAppointment"; // Import MyAppointment component

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // Toggle for Edit Profile form
  const [isRequestingAppointment, setIsRequestingAppointment] = useState(false); // Toggle for Appointment Request form
  const [selectedNav, setSelectedNav] = useState("dashboard"); // Track active navigation
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [newAppointments, setNewAppointments] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // Track loading state

  // Fetch patient data
  useEffect(() => {
    const fetchPatientData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid); // Fetch from users collection
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().role === "patient") {
          setPatient(docSnap.data()); // Set patient data from users collection
        }
      } else {
        navigate("/login"); // Redirect to login if no user is logged in
      }
      setIsLoading(false);
    };
  
    fetchPatientData();
  }, [navigate]);

  // Listen for real-time updates for patient appointments
  useEffect(() => {
    const unsubscribeAppointments = onSnapshot(collection(db, "appointments"), (snapshot) => {
      setAppointmentCount(snapshot.docs.length);
      setNewAppointments(snapshot.docs.filter(doc => doc.data().status === "new").length);
    });

    return () => unsubscribeAppointments();
  }, []);

  // Logout function
  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };
  
  const handleNavClick = (menu) => {
    setSelectedNav(menu);
  
    if (menu === "dashboard") {
      setIsEditing(false);
      setIsRequestingAppointment(false);
    } else if (menu === "editProfile") {
      setIsEditing(true);
      setIsRequestingAppointment(false);
    } else if (menu === "requestAppointment") {
      setIsRequestingAppointment(true); // Ensure Request Appointment is displayed
      setIsEditing(false);
    } else if (menu === "myAppointments") {
      setIsRequestingAppointment(false);
      setIsEditing(false);
    }
  };

  if (isLoading) {
    return <div>Loading patient data...</div>; // Display loading message if patient data is still being fetched
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="profile">
          {/* Use default profile picture if no profilePic */}
          <img
            src={patient?.profilePic || "/default-profile.png"} // Default image if no profile pic
            alt="Profile"
            className="profile-pic"
          />
          <h3>{patient?.name || "Test Patient"}</h3>
          <p>{patient?.email || "patient@edoc.com"}</p>
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
            className={`nav-link ${selectedNav === "requestAppointment" ? "active" : ""}`}
            onClick={() => handleNavClick("requestAppointment")}
          >
            Request Appointment
          </button>
          <button
            className={`nav-link ${selectedNav === "myAppointments" ? "active" : ""}`}
            onClick={() => handleNavClick("myAppointments")}
          >
            My Appointments
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {isEditing ? (
          <PEditProfile
            patient={patient}
            setPatient={setPatient}
            setIsEditing={setIsEditing}
          />
        ) : isRequestingAppointment ? (
          <AppointmentRequest patient={patient} />
        ) : selectedNav === "myAppointments" ? (
          <MyAppointment
            patient={patient}
            setSelectedNav={setSelectedNav} // Pass setSelectedNav to MyAppointment
          />
        ) : (
          <>
            {/* Welcome Section */}
            <section className="welcome-section">
              <h2>
                Welcome! <strong>{patient?.name || "Test Patient"}</strong>
              </h2>
              <p>Manage your appointments and profile.</p>
              <button
                className="btn primary-btn"
                onClick={() => handleNavClick("myAppointments")}
              >
                View My Appointments
              </button>
            </section>

            {/* Status Overview */}
            <section className="status-section">
              <div className="status-card">
                <h3>{appointmentCount}</h3>
                <p>All Appointments</p>
              </div>
              <div className="status-card">
                <h3>{newAppointments}</h3>
                <p>New Appointments</p>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default PatientDashboard;
