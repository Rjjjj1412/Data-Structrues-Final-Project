import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase"; // Import Firebase configurations
import { collection, addDoc, Timestamp } from "firebase/firestore";
import "../styles/CreateSchedule.css";

const CreateSchedule = () => {
  const [scheduleData, setScheduleData] = useState({
    date: "",
    time: "",
    roomNumber: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(""); 
  const [doctor, setDoctor] = useState(null); // Store doctor data

  // Fetch doctor data from Firebase Authentication
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setDoctor(currentUser); // Set doctor to the current logged-in user
    } else {
      setError("Please log in to continue.");
    }
  }, []);

  // Handle schedule data change
  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    setScheduleData({ ...scheduleData, [name]: value });
  };

  // Submit schedule
  const handleSubmitSchedule = async (e) => {
    e.preventDefault();

    if (!doctor) {
      setError("Doctor ID is not available. Please log in again.");
      return;
    }

    try {
      setIsLoading(true);
      // Store schedule data in Firestore
      await addDoc(collection(db, "doctorSchedules"), {
        doctorId: doctor.uid, // Use the doctor UID from Firebase Authentication
        date: scheduleData.date,
        time: scheduleData.time,
        roomNumber: scheduleData.roomNumber,
        createdAt: Timestamp.now(),
      });
      alert("Schedule created successfully!");
      setIsLoading(false);
      setScheduleData({
        date: "",
        time: "",
        roomNumber: "",
      });
    } catch (error) {
      console.error("Error creating schedule:", error.message);
      setError("Error: " + error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="create-schedule-container">
      <h2>Create Schedule</h2>

      {/* Error Message */}
      {error && <p className="error-message">{error}</p>}

      {/* Form to create schedule */}
      {doctor ? (
        <form onSubmit={handleSubmitSchedule}>
          <div className="form-group">
            <label>Schedule Date</label>
            <input
              type="date"
              name="date"
              value={scheduleData.date}
              onChange={handleScheduleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Schedule Time</label>
            <input
              type="time"
              name="time"
              value={scheduleData.time}
              onChange={handleScheduleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Room Number</label>
            <input
              type="text"
              name="roomNumber"
              value={scheduleData.roomNumber}
              onChange={handleScheduleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-create" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Schedule"}
          </button>
        </form>
      ) : (
        <p>Please log in to create a schedule.</p>
      )}
    </div>
  );
};

export default CreateSchedule;
