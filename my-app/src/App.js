import React, { useState } from "react";
import './App.css';
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./Routes";
import { AuthContext } from './context/AuthContext'; // Adjust path as needed

const App = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const logOut = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ isLoaded: true, user, token, setUser, setToken, logOut }}>
      <div className="App">
        <Router>
          <AppRoutes />
        </Router>
      </div>
    </AuthContext.Provider>
  );
};

export default App;
