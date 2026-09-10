import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./index.css";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }

    try {
      const response = await fetch("https://salessavvy-d7qc.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.role !== "ADMIN") {
          throw new Error("Access denied. Admin credentials required.");
        }

        localStorage.setItem("username", data.username || username);
        if (data.token) localStorage.setItem("token", data.token);
        if (data.role) localStorage.setItem("role", data.role);

        navigate("/admindashboard");
      } else {
        const errorMessage = data.error || "Invalid admin credentials.";
        throw new Error(errorMessage);
      }
    } catch (err) {
      setError(err.message || "Unexpected error occurred");
    }
  };

  return (
    <div className="admin-bg">
      <div className="page-container1">
        <div className="form-container">
          <h1 className="form-title">Admin Portal</h1>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSignIn} className="form-content">
            <div className="form-group">
              <label htmlFor="admin-username" className="form-label">
                Admin Username
              </label>
              <input
                id="admin-username"
                type="text"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="admin-password" className="form-label">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <button
              type="submit"
              className="form-button"
              style={{ background: "#0f172a", color: "#fff" }}
            >
              Sign In as Admin
            </button>
          </form>

          <div className="form-footer">
            <Link to="/" className="form-link">
              &larr; Back to Customer Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}