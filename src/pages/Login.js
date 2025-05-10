import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Styles/Login.css'; // We'll define styles here
import api from '../Services/Api';

const LoginPage = () => {
  const navigate = useNavigate();


  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setForm(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await api.post('/admin/login', {
        email: form.email,
        password: form.password
      });

      const { token, admin } = res.data;

      // Store token and admin info in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('admin', JSON.stringify(admin));
      // console.log(localStorage.getItem('token'));

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', form.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <div className="left-side">
        <div className="logo">Travel & Earn</div>
        <h2>Sign In</h2>
        <p>Sign in to stay connected.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <div className="options">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me?
            </label>
            <a href="/forgot-password">Forgot Password?</a>
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit">Sign in</button>
        </form>
      </div>

      <div className="right-side">
        {/* Background design */}
      </div>
    </div>
  );
};

export default LoginPage;
