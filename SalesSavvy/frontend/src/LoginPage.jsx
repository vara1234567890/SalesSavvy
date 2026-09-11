import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./index.css";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }

    setIsLoading(true);

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
        // 1. Detect and save JWT token from any common backend field name
        const authToken =
          data.token ||
          data.jwt ||
          data.jwtToken ||
          data.accessToken ||
          data?.data?.token;

        if (authToken) {
          localStorage.setItem("token", authToken);
          localStorage.setItem("jwtToken", authToken);
        }

        // 2. Save user details
        localStorage.setItem("username", data.username || username);
        if (data.userId || data.id || data.user_id) {
          localStorage.setItem("userId", data.userId || data.id || data.user_id);
        }
        if (data.role) {
          localStorage.setItem("role", data.role);
        }

        // 3. Route according to role
        if (data.role === "ADMIN") {
          navigate("/admindashboard");
        } else {
          navigate("/customerhome");
        }
      } else {
        const errorMessage = data.message || data.error || "Invalid username or password.";
        throw new Error(errorMessage);
      }
    } catch (err) {
      setError(err.message || "Unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="customer-bg">
      <div className="page-container1">
        <div className="form-container">
          <h1 className="form-title">Customer Login</h1>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSignIn} className="form-content">
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <button type="submit" className="form-button" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="form-footer">
            <Link to="/register" className="form-link">
              Don't have an account? Register here
            </Link>

            <div
              style={{
                marginTop: "16px",
                paddingTop: "12px",
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <Link
                to="/admin"
                className="form-link"
                style={{
                  fontWeight: "600",
                  color: "#2563eb",
                  display: "inline-block",
                }}
              >
                Go to Admin Login &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
