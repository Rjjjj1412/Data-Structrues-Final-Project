import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";  // Ensure this is at the top
import "../styles/RequestAppointment.css";
import "bootstrap/dist/css/bootstrap.min.css";

const RequestAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialization, setSpecialization] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [concerns, setConcerns] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const fetchDoctors = async () => {
      const q = specialization
        ? query(collection(db, "users"), where("role", "==", "doctor"), where("specialization", "==", specialization))
        : query(collection(db, "users"), where("role", "==", "doctor"));

      const querySnapshot = await getDocs(q);
      const doctorsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const doctorsWithSchedules = await Promise.all(doctorsList.map(async (doctor) => {
        const scheduleSnapshot = await getDocs(query(collection(db, "doctorSchedules"), where("doctorId", "==", doctor.id)));
        const schedules = scheduleSnapshot.docs
          .map(scheduleDoc => ({ id: scheduleDoc.id, ...scheduleDoc.data() }))
          .filter(schedule => schedule.status !== "Booked"); // EXCLUDE BOOKED SCHEDULES

        return { ...doctor, schedules };
      }));

      setDoctors(doctorsWithSchedules);
    };

    fetchDoctors();
  }, [specialization]);

  const formatTime = (time) => {
    if (!time) return "";
    const [hour, minute] = time.split(":");
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minute} ${period}`;
  };

  const generateRefNumber = () => {
    return "REF-" + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const bookAppointment = async () => {
    if (!selectedDoctor || !selectedSchedule) return;

   // Fetch patient's name from the users collection
  const patientDocRef = doc(db, "users", auth.currentUser.uid);
  const patientDoc = await getDoc(patientDocRef); // Correct method for fetching a single document
  const patientName = patientDoc.exists() ? patientDoc.data().name : "Unknown Patient";


    // Add appointment to database
    await addDoc(collection(db, "patientsappointment"), {
      doctorId: selectedDoctor.id,
      doctorName: `Dr. ${selectedDoctor.name}`,
      patientId: auth.currentUser.uid,
      patientName,  // Add patient's name here
      concerns,
      schedule: selectedSchedule,
      status: "Pending",
      dateBooked: new Date().toISOString(),
      refNumber: generateRefNumber(),
    });

    // Update schedule to mark it as "Booked"
    await updateDoc(doc(db, "doctorSchedules", selectedSchedule.id), {
      status: "Booked",
    });

    alert("Appointment request sent!");
    setIsBooking(false);
    setSelectedSchedule(null);

    // Refresh doctor list to reflect removed booked schedules
    setDoctors((prevDoctors) =>
      prevDoctors.map((doctor) =>
        doctor.id === selectedDoctor.id
          ? {
              ...doctor,
              schedules: doctor.schedules.filter(
                (s) => s.id !== selectedSchedule.id && s.status !== "Booked"
              ),
            }
          : doctor
      )
    );

    // Also, update the available schedules in modal
    setAvailableSchedules((prevSchedules) =>
      prevSchedules.filter((s) => s.id !== selectedSchedule.id && s.status !== "Booked")
    );
  };

  const getDayOfWeek = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: "long" };
    return date.toLocaleDateString("en-US", options);
  };

  const getUniqueDays = (schedules) => {
    if (!schedules || schedules.length === 0) return "No schedules available";
    const days = schedules.map(schedule => getDayOfWeek(schedule.date));
    return [...new Set(days)].join(", ");
  };

  // Updated goBackToDashboard function to use navigate
  const goBackToDashboard = () => {
    navigate("/patient-dashboard"); // Navigate to the patient dashboard route
  };

  return (
    <div className="appointment-container container mt-4">
      <h2 className="text-center mb-4">Request an Appointment</h2>

      <label>Filter by Specialization:</label>
      <select value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="form-control mb-3">
        <option value="">Select Specialization</option>
        {["Cardiology", "Dermatology", "Neurology", "Pediatrics", "Orthopedics", "Psychiatry", "General Medicine", "Surgery", "Ophthalmology", "ENT", "Others"].map((spec, index) => (
          <option key={index} value={spec}>{spec}</option>
        ))}
      </select>

      <div className="doctor-list row">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="doctor-card col-md-4 p-3 mb-3 shadow-sm rounded border">
            <h4>Dr. {doctor.name}</h4>
            <p><strong>Specialization:</strong> {doctor.specialization}</p>
            <p><strong>Available Days:</strong> {getUniqueDays(doctor.schedules)}</p>
            {doctor.schedules.length > 0 ? (
              <button className="btn btn-success" onClick={() => {
                setSelectedDoctor(doctor);
                setAvailableSchedules(doctor.schedules);
                setIsBooking(true);
              }}>
                Book for Consultation
              </button>
            ) : (
              <button className="btn btn-secondary" disabled>No Available Schedules</button>
            )}
          </div>
        ))}
      </div>

      {isBooking && selectedDoctor && (
        <div className="modal show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Book Appointment - Dr. {selectedDoctor.name}</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => setIsBooking(false)}></button>
              </div>
              <div className="modal-body">
                <h5>Select a Schedule:</h5>
                {availableSchedules.length > 0 ? (
                  availableSchedules.map((schedule, index) => (
                    <div key={index} className={`schedule-option ${selectedSchedule === schedule ? "selected-schedule" : ""}`}>
                      <input
                        type="radio"
                        id={`schedule-${index}`}
                        checked={selectedSchedule === schedule}
                        onChange={() => setSelectedSchedule(schedule)}
                      />
                      <label htmlFor={`schedule-${index}`}>
                        <strong>{getDayOfWeek(schedule.date)}</strong> - {formatTime(schedule.time)} {schedule.roomNumber ? `(Room ${schedule.roomNumber})` : "(No Room Assigned)"}
                      </label>
                    </div>
                  ))
                ) : (
                  <p>No available schedules</p>
                )}

                <textarea
                  value={concerns}
                  onChange={(e) => setConcerns(e.target.value)}
                  placeholder="Any concerns?"
                  className="form-control mb-3"
                />

                <button className="btn btn-primary w-100" onClick={bookAppointment} disabled={!selectedSchedule}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button className="btn btn-primary mt-4 w-100" onClick={goBackToDashboard}>
        Go Back to Dashboard
      </button>
    </div>
  );
};

export default RequestAppointment;
