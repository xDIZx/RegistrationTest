import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import Axios

function RegistrationForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,20}$/;
    return re.test(password) && !/^[^a-zA-Z\d].*[^a-zA-Z\d]$/.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('Invalid email format');
      return;
    }
    if (!validatePassword(password)) {
      setError('Password must be 6-20 characters long, include 1 uppercase, 1 lowercase, 1 number, and 1 special character (not at the start or end).');
      return;
    }

    try {
      // Make a POST request to the backend registration route
      await axios.post('http://localhost:5000/register', { email, password });
      navigate('/login');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        // Specific error for duplicate email
        setError('Email already in use');
      } else {
        // General error message
        setError('Error registering user');
      }
    }
  };

  return (
    <div className="main">
      <p className="sign" style={{ textAlign: 'center' }}>Register</p>
      <form className="form1" onSubmit={handleSubmit}>
        <input
          className="inputField"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="inputField"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="submit" type="submit">Register</button>
        <p className="forgot" style={{ textAlign: 'center' }}>{error}</p>
        <p className="forgot" style={{ textAlign: 'center' }}>
          Already have an account? <a href="/login">Login here</a>
        </p>
      </form>
    </div>
  );
}

export default RegistrationForm;
