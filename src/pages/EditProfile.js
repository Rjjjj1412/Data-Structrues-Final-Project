import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/EditProfile.css"; // Add appropriate styling for the page

const EditProfile = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    specialization: "",
    otherSpecialization: "",
    licenseNumber: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch doctor data on load
  useEffect(() => {
    const fetchDoctorData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const doctorData = docSnap.data();
          setFormData({
            name: doctorData.name,
            email: doctorData.email,
            specialization: doctorData.specialization,
            otherSpecialization: doctorData.specialization === "Others" ? doctorData.otherSpecialization : "",
            licenseNumber: doctorData.licenseNumber,
          });
        }
      } else {
        navigate("/login"); // Redirect to login if no user is logged in
      }
    };

    fetchDoctorData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      // Update doctor data in Firestore (no profile pic field)
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        name: formData.name,
        email: formData.email,
        specialization: formData.specialization === "Others" ? formData.otherSpecialization : formData.specialization,
        licenseNumber: formData.licenseNumber,
      });

      alert("Profile updated successfully!");
      setIsLoading(false);
      navigate("/doctor-dashboard"); // Redirect after update
    } catch (error) {
      console.error("Error updating profile:", error.message);
      alert("Error: " + error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>
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
            <option value="Others">Others</option>
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

        <button type="submit" className="btn btn-update" disabled={isLoading}>
          {isLoading ? "Updating..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
