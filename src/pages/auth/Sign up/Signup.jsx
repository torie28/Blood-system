import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const [accountType, setAccountType] = useState("donor"); // 'donor' | 'hospital'
  const [hospitals, setHospitals] = useState([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    location: "",
    phone_number: "",
    blood_group: "",
    blood_type: "",
    hospital_id: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch hospitals when hospital account type is selected
  useEffect(() => {
    if (accountType === "hospital" && hospitals.length === 0) {
      setHospitalsLoading(true);
      fetch("http://localhost:8000/api/hospitals")
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setHospitals(data.data);
        })
        .catch(console.error)
        .finally(() => setHospitalsLoading(false));
    }
  }, [accountType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = "Name is required";

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.phone_number)
      newErrors.phone_number = "Phone number is required";

    if (accountType === "hospital") {
      if (!formData.hospital_id)
        newErrors.hospital_id = "Please select your hospital";
    } else {
      if (!formData.location) newErrors.location = "Location is required";
      if (!formData.blood_group)
        newErrors.blood_group = "Blood group is required";
      if (!formData.blood_type) newErrors.blood_type = "Blood type is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const payload =
        accountType === "hospital"
          ? {
              role: "hospital",
              name: formData.name,
              email: formData.email,
              password: formData.password,
              password_confirmation: formData.confirmPassword,
              phone_number: formData.phone_number,
              hospital_id: formData.hospital_id,
            }
          : {
              role: "donor",
              name: formData.name,
              email: formData.email,
              password: formData.password,
              password_confirmation: formData.confirmPassword,
              location: formData.location,
              phone_number: formData.phone_number,
              blood_group: formData.blood_group,
              blood_type: formData.blood_type,
            };

      const response = await fetch("http://127.0.0.1:8000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/signin");
      } else {
        setErrors({
          general: data.message || "Registration failed. Please try again.",
        });
      }
    } catch (_err) {
      setErrors({ general: "Registration failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="classic-signin-container">
      <div className="classic-signin-form">
        <div className="classic-signin-header">
          <h1 className="classic-signin-title">Sign Up</h1>
          <p className="classic-signin-subtitle">Create your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div className="classic-signin-error">{errors.general}</div>
          )}

          {/* Account type selector */}
          <div
            className="classic-signin-input-group"
            style={{ marginBottom: "1.25rem" }}
          >
            <label className="classic-signin-label">Account Type</label>
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  cursor: "pointer",
                  fontWeight: accountType === "donor" ? "600" : "400",
                }}
              >
                <input
                  type="radio"
                  name="accountType"
                  value="donor"
                  checked={accountType === "donor"}
                  onChange={() => setAccountType("donor")}
                />
                🩸 Blood Donor
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  cursor: "pointer",
                  fontWeight: accountType === "hospital" ? "600" : "400",
                }}
              >
                <input
                  type="radio"
                  name="accountType"
                  value="hospital"
                  checked={accountType === "hospital"}
                  onChange={() => setAccountType("hospital")}
                />
                🏥 Hospital Staff
              </label>
            </div>
          </div>

          <div className="signup-grid-container">
            <div className="signup-left-column">
              {/* Name */}
              <div className="classic-signin-input-group">
                <label className="classic-signin-label">Full Name</label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={`classic-signin-input ${errors.name ? "classic-signin-input-error" : ""}`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="classic-signin-error-text">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="classic-signin-input-group">
                <label className="classic-signin-label">Email Address</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`classic-signin-input ${errors.email ? "classic-signin-input-error" : ""}`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="classic-signin-error-text">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="classic-signin-input-group">
                <label className="classic-signin-label">Password</label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`classic-signin-input ${errors.password ? "classic-signin-input-error" : ""}`}
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="classic-signin-error-text">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="classic-signin-input-group">
                <label className="classic-signin-label">Confirm Password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`classic-signin-input ${errors.confirmPassword ? "classic-signin-input-error" : ""}`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className="classic-signin-error-text">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="signup-right-column">
              {/* Phone */}
              <div className="classic-signin-input-group">
                <label className="classic-signin-label">Phone Number</label>
                <input
                  name="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className={`classic-signin-input ${errors.phone_number ? "classic-signin-input-error" : ""}`}
                  placeholder="Enter your phone number"
                />
                {errors.phone_number && (
                  <p className="classic-signin-error-text">
                    {errors.phone_number}
                  </p>
                )}
              </div>

              {accountType === "hospital" ? (
                /* Hospital-specific fields */
                <div className="classic-signin-input-group">
                  <label className="classic-signin-label">Your Hospital</label>
                  <select
                    name="hospital_id"
                    value={formData.hospital_id}
                    onChange={handleChange}
                    className={`classic-signin-input ${errors.hospital_id ? "classic-signin-input-error" : ""}`}
                    disabled={hospitalsLoading}
                  >
                    <option value="">
                      {hospitalsLoading
                        ? "Loading hospitals..."
                        : "Select your hospital..."}
                    </option>
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                  {errors.hospital_id && (
                    <p className="classic-signin-error-text">
                      {errors.hospital_id}
                    </p>
                  )}
                </div>
              ) : (
                /* Donor-specific fields */
                <>
                  <div className="classic-signin-input-group">
                    <label className="classic-signin-label">Location</label>
                    <input
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleChange}
                      className={`classic-signin-input ${errors.location ? "classic-signin-input-error" : ""}`}
                      placeholder="Enter your location"
                    />
                    {errors.location && (
                      <p className="classic-signin-error-text">
                        {errors.location}
                      </p>
                    )}
                  </div>

                  <div className="classic-signin-input-group">
                    <label className="classic-signin-label">Blood Group</label>
                    <select
                      name="blood_group"
                      value={formData.blood_group}
                      onChange={handleChange}
                      className={`classic-signin-input ${errors.blood_group ? "classic-signin-input-error" : ""}`}
                    >
                      <option value="">Select blood group</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="AB">AB</option>
                      <option value="O">O</option>
                    </select>
                    {errors.blood_group && (
                      <p className="classic-signin-error-text">
                        {errors.blood_group}
                      </p>
                    )}
                  </div>

                  <div className="classic-signin-input-group">
                    <label className="classic-signin-label">Blood Type</label>
                    <select
                      name="blood_type"
                      value={formData.blood_type}
                      onChange={handleChange}
                      className={`classic-signin-input ${errors.blood_type ? "classic-signin-input-error" : ""}`}
                    >
                      <option value="">Select blood type</option>
                      <option value="+">Positive (+)</option>
                      <option value="-">Negative (-)</option>
                    </select>
                    {errors.blood_type && (
                      <p className="classic-signin-error-text">
                        {errors.blood_type}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="signup-button-container">
            <button
              type="submit"
              disabled={isLoading}
              className="classic-signin-submit-button"
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
          </div>

          <div className="classic-signin-register-section">
            Already have an account?{" "}
            <Link to="/signin" className="classic-signin-register-link">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
