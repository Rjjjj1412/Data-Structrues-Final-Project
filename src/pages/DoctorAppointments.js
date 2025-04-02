import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is imported
import '../styles/DoctorAppointments.css'

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      const appointmentsRef = collection(db, "patientsappointment");
      const q = query(appointmentsRef, where("status", "in", ["Pending", "Approved"]));
      const querySnapshot = await getDocs(q);

      const appointmentsList = [];
      for (const appointmentDoc of querySnapshot.docs) {
        const appointmentData = appointmentDoc.data();
        
        // Fetching patient data using patientId
        const patientDocRef = doc(db, "users", appointmentData.patientId);
        const patientDoc = await getDoc(patientDocRef);
        const patientData = patientDoc.exists() ? patientDoc.data() : {};

        // Convert schedule time to AM/PM format
        let formattedTime = "N/A";
        if (appointmentData.schedule?.time) {
          const [hours, minutes] = appointmentData.schedule.time.split(":").map(Number);
          if (!isNaN(hours) && !isNaN(minutes)) {
            formattedTime = new Date(0, 0, 0, hours, minutes).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });
          }
        }

        // Add patientName and formattedTime to the appointment data
        appointmentsList.push({
          id: appointmentDoc.id,
          ...appointmentData,
          patientName: patientData.name || "N/A",
          formattedTime // Store formatted time
        });
      }

      setAppointments(appointmentsList);
      setLoading(false);
    };

    fetchAppointments();
  }, []);

  const approveAppointment = async (appointmentId) => {
    await updateDoc(doc(db, "patientsappointment", appointmentId), {
      status: "Approved"
    });
    setAppointments(prevAppointments =>
      prevAppointments.map(appointment =>
        appointment.id === appointmentId ? { ...appointment, status: "Approved" } : appointment
      )
    );
  };

  const completeAppointment = async (appointmentId) => {
    await updateDoc(doc(db, "patientsappointment", appointmentId), {
      status: "Completed"
    });
    setAppointments(prevAppointments =>
      prevAppointments.map(appointment =>
        appointment.id === appointmentId ? { ...appointment, status: "Completed" } : appointment
      )
    );
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Appointments</h2>
      {loading ? (
        <div className="text-center">
          <p>Loading...</p>
        </div>
      ) : (
        <table className="table table-striped table-bordered">
          <thead className="thead-dark">
            <tr>
              <th>Patient Name</th>
              <th>Concerns</th>
              <th>Date Booked</th>
              <th>Scheduled Date</th>
              <th>Room</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(appointment => (
              <tr key={appointment.id}>
                <td>{appointment.patientName}</td>
                <td>{appointment.concerns || "N/A"}</td>
                <td>{new Date(appointment.dateBooked).toLocaleString()}</td>
                <td>{new Date(appointment.schedule?.date).toLocaleDateString()}</td>
                <td>{appointment.schedule?.roomNumber || "N/A"}</td>
                <td>{appointment.formattedTime}</td> {/* Display formatted time */}
                <td>
                  <span
                    className={`badge ${
                      appointment.status === "Pending"
                        ? "bg-warning text-dark"
                        : appointment.status === "Approved"
                        ? "bg-success"
                        : appointment.status === "Completed"
                        ? "bg-primary"
                        : "bg-secondary"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </td>
                <td>
                  {appointment.status === "Pending" && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => approveAppointment(appointment.id)}
                    >
                      Approve
                    </button>
                  )}
                  {appointment.status === "Approved" && (
                    <button
                      className="btn btn-primary"
                      onClick={() => completeAppointment(appointment.id)}
                    >
                      Complete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DoctorAppointments;
