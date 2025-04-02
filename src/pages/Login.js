import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Auth.css';  
import logo from '../img/logo.png';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  const validateForm = () => {
    if (!email || !password) {
      setError('Please fill out both fields');
      return false;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email format');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user role from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role;

        // Redirect based on user role
        if (role === 'doctor') {
          navigate('/doctor-dashboard'); // Redirect to doctor dashboard
        } else {
          navigate('/patient-dashboard'); // Redirect to patient dashboard
        }
      } else {
        setError('User data not found.');
      }
    } catch (error) {
      console.error('Login error:', error.message);
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="container-fluid h-100 d-flex justify-content-center align-items-center">
      <div className="login-form bg-white p-4 shadow rounded">
        <div className="logo-container text-center mb-4">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <h2 className="login-title text-center">Login</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="font-weight-bold">Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="Enter email"
              value={email}
              onChange={handleEmailChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="font-weight-bold">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              placeholder="Enter password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">Login</button>
        </form>

        <div className="signup-text text-center mt-3">
          <span>Don't have an account? <Link to="/register" className="signup-link">Sign up</Link></span>
        </div>
      </div>
    </div>
  );
};

export default Login;
