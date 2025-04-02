import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/RegisterForm.css";
import { auth, db } from "../firebase"; 
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const Doctorreg = () => {
  const navigate = useNavigate(); // Initialize useNavigate hook for navigation
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    otherSpecialization: "",  // State to handle custom specialization if "Others" is selected
    licenseNumber: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Register the doctor with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Store doctor data in Firestore using UID as document ID
      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        email: formData.email,
        specialization: formData.specialization === "Others" ? formData.otherSpecialization : formData.specialization,
        licenseNumber: formData.licenseNumber,
        role: "doctor", // Add user role for role-based login
      });

      alert("Doctor registered successfully!");
      navigate("/login"); // Redirect to login page

    } catch (error) {
      console.error("Error registering doctor:", error.message);
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="container-fluid h-100 d-flex justify-content-center align-items-center">
      <div className="registration-container">
        <h2 className="registration-title">Doctor Registration</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Specialization</label>
            <select
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              required
            >
              <option value="">Select Specialization</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Neurology">Neurology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Psychiatry">Psychiatry</option>
              <option value="General Medicine">General Medicine</option>
              <option value="Surgery">Surgery</option>
              <option value="Ophthalmology">Ophthalmology</option>
              <option value="ENT">ENT</option>
              <option value="Others">Others</option> {/* Option for custom specialization */}
            </select>
          </div>

          {formData.specialization === "Others" && (
            <div className="form-group">
              <label>Enter Specialization</label>
              <input
                type="text"
                name="otherSpecialization"
                value={formData.otherSpecialization}
                onChange={handleChange}
                required={formData.specialization === "Others"}
              />
            </div>
          )}

          <div className="form-group">
            <label>License Number</label>
            <input
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-register">Register</button>
        </form>

        <div className="back-link">
          <Link to="/register">Back to Registration</Link>
        </div>
      </div>
    </div>
  );
};

export default Doctorreg;
