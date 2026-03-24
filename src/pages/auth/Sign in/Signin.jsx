import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext.jsx';

const Signin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();

        if (Object.keys(newErrors).length === 0) {
            setIsLoading(true);
            setErrors({});

            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Extract user name from email (for demo purposes)
                const userName = formData.email.split('@')[0];
                const userData = {
                    name: userName.charAt(0).toUpperCase() + userName.slice(1),
                    email: formData.email,
                    role: 'donor'
                };

                // Handle successful login
                login(userData);
                console.log('Login successful:', formData);
                navigate('/dashboard/donor');
            } catch (error) {
                setErrors({ general: 'Invalid email or password' });
            } finally {
                setIsLoading(false);
            }
        } else {
            setErrors(newErrors);
        }
    };

    const handleSocialLogin = (provider) => {
        console.log(`Login with ${provider}`);
        // Implement social login logic here
    };

    return (
        <div className="classic-signin-container">
            <div className="classic-signin-form">
                <div className="classic-signin-header">
                    <h1 className="classic-signin-title">Sign In</h1>
                    <p className="classic-signin-subtitle">Please enter your credentials</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {errors.general && (
                        <div className="classic-signin-error">
                            {errors.general}
                        </div>
                    )}

                    <div className="classic-signin-input-group">
                        <label className="classic-signin-label">
                            Email Address
                        </label>
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`classic-signin-input ${errors.email ? 'classic-signin-input-error' : ''}`}
                            placeholder="Enter your email"
                        />
                        {errors.email && (
                            <p className="classic-signin-error-text">{errors.email}</p>
                        )}
                    </div>

                    <div className="classic-signin-input-group">
                        <label className="classic-signin-label">
                            Password
                        </label>
                        <input
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`classic-signin-input ${errors.password ? 'classic-signin-input-error' : ''}`}
                            placeholder="Enter your password"
                        />
                        {errors.password && (
                            <p className="classic-signin-error-text">{errors.password}</p>
                        )}
                    </div>

                    <div className="classic-signin-checkbox-container">
                        <label className="classic-signin-checkbox-label">
                            <input
                                type="checkbox"
                                className="classic-signin-checkbox"
                            />
                            Remember me
                        </label>
                        <a href="#" className="classic-signin-forgot-link">
                            Forgot Password?
                        </a>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="classic-signin-submit-button"
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>

                    <div className="classic-signin-register-section">
                        Don't have an account?{' '}
                        <Link to="/signup" className="classic-signin-register-link">
                            Register here
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signin;