import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/MyAppointment.css";

const MyAppointment = ({ setSelectedNav }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "patientsappointment"), where("patientId", "==", auth.currentUser.uid));

    // Listen for real-time updates
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const appointmentsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAppointments(appointmentsList);
      setLoading(false);  // Ensure loading state updates
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  const handleCancelAppointment = async () => {
    if (!appointmentToCancel) return;

    try {
      const { id, schedule } = appointmentToCancel;

      // Update the schedule's status to "Available"
      await updateDoc(doc(db, "doctorSchedules", schedule.id), { status: "Available" });

      // Delete the patient's appointment record
      await deleteDoc(doc(db, "patientsappointment", id));

      // No need to manually update state—Firestore updates in real-time now!
      setAppointmentToCancel(null);
    } catch (error) {
      console.error("Error canceling appointment:", error);
    }
  };

  // Handle navigation click for "Request Appointment"
  const handleNavClick = (menu) => {
    setSelectedNav(menu);
    if (menu === "requestAppointment") {
      navigate("/patient-dashboard/request");
    }
  };

  const formatTime = (time) => {
    if (!time) return "";
    const [hour, minute] = time.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minute.toString().padStart(2, "0")} ${period}`;
  };
  

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">My Appointments</h2>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center">
          <p className="lead">No appointments to display.</p>
          <div 
            className="menu btn btn-primary" 
            onClick={() => handleNavClick("requestAppointment")}
          >
            Request Appointment
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-bordered table-hover">
            <thead className="thead-dark">
              <tr>
                <th>Doctor Name</th>
                <th>Room Number</th>
                <th>Date</th>
                <th>Time</th>
                <th>Reference Number</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.doctorName}</td>
                  <td>{appointment.schedule?.roomNumber || "Not assigned"}</td>
                  <td>{new Date(appointment.schedule?.date).toLocaleDateString()}</td>
                  <td>{formatTime(appointment.schedule?.time)}</td>
                  <td>{appointment.refNumber}</td>
                  <td>
                    <span
                      className={`badge ${
                        appointment.status === "Pending"
                          ? "status-pending"
                          : appointment.status === "Confirmed"
                          ? "status-confirmed"
                          : "status-canceled"
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </td>
                  <td>
                    {appointment.status === "Pending" && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setAppointmentToCancel(appointment)}
                        data-toggle="modal"
                        data-target="#cancelModal"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {appointmentToCancel && (
        <div className="modal fade show" id="cancelModal" tabIndex="-1" role="dialog" style={{ display: "block" }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Cancellation</h5>
                <button type="button" className="close" onClick={() => setAppointmentToCancel(null)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">Are you sure you want to cancel this appointment?</div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setAppointmentToCancel(null)}>
                  No
                </button>
                <button type="button" className="btn btn-danger" onClick={handleCancelAppointment}>
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointment;
