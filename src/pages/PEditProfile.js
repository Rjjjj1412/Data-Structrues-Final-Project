import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/PEditProfile.css";

const PEditProfile = ({ setIsEditing }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch patient data on load
  useEffect(() => {
    const fetchPatientData = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login"); // Redirect to login if not authenticated
        return;
      }

      const docRef = doc(db, "users", user.uid); // ✅ Now targeting "users" collection
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        
        // ✅ Ensure it's a patient before setting form data
        if (userData.role === "patient") {
          setFormData({
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            age: userData.age || "",
          });
        } else {
          console.error("User is not a patient.");
          alert("Error: Profile not found.");
        }
      } else {
        console.error("No patient document found in Firestore.");
        alert("Error: Patient profile not found.");
      }
    };

    fetchPatientData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated.");

      const userRef = doc(db, "users", user.uid); // ✅ Now updating "users"
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();

        // ✅ Ensure only patients can update their profile
        if (userData.role === "patient") {
          await updateDoc(userRef, {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            age: formData.age,
          });
          alert("Profile updated successfully!");
          setIsEditing(false); // Exit edit mode
        } else {
          console.error("User is not a patient.");
          alert("Error: Unauthorized profile update.");
        }
      } else {
        console.error("No document to update.");
        alert("Error: Patient profile not found.");
      }
    } catch (error) {
      console.error("Error updating profile:", error.message);
      alert("Error: " + error.message);
    } finally {
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
          <label>Phone</label>
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Age</label>
          <input type="number" name="age" value={formData.age} onChange={handleChange} required />
        </div>

        <button type="submit" className="btn btn-update" disabled={isLoading}>
          {isLoading ? "Updating..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default PEditProfile;
