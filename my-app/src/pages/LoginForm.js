import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUseHttp } from '../hooks/http.hook';
import { AuthContext } from '../context/AuthContext'; // Import the context
import { useContext } from 'react';

const useHttp = createUseHttp();

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setToken } = useContext(AuthContext); // Use context to set token
  const { request, loading } = useHttp();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = await request('/login', 'POST', { email, password });
      localStorage.setItem('token', data.token);
      setToken(data.token); // Update the context with the token
      navigate('/admin');
    } catch (e) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="main">
      <p className="sign" style={{textAlign: 'center'}}>Login</p>
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
        <button className="submit" type="submit" disabled={loading}>Login</button>
        <p className="forgot" style={{textAlign: 'center'}}>{error}</p>
        <p className="forgot" style={{textAlign: 'center'}}>
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </form>
    </div>
  );
}

export default LoginForm;
