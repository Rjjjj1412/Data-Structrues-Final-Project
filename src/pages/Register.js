import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaUserMd, FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import "../styles/Register.css";

const Register = () => {
  const navigate = useNavigate();

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-lg text-center" style={{ maxWidth: '400px', width: '100%', borderRadius: '12px' }}>
        <h2 className="mb-4 text-primary">Sign Up</h2>
        <p className="text-muted">Choose your role to continue</p>

        <div className="d-grid gap-3">
          <button 
            className="btn btn-outline-primary d-flex align-items-center justify-content-center py-3"
            onClick={() => navigate('/register/patient')}
          >
            <FaUser className="me-2" size={20} /> Register as Patient
          </button>

          <button 
            className="btn btn-outline-secondary d-flex align-items-center justify-content-center py-3"
            onClick={() => navigate('/register/doctor')}
          >
            <FaUserMd className="me-2" size={20} /> Register as Doctor
          </button>
        </div>
        <div className="back-link">
          <Link to="/login">Back to Log-In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
