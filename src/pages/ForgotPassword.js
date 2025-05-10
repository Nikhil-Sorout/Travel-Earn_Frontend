import React, { useState } from 'react';
import api from '../Services/Api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/forgot-password', { email });
      setMessage(res.data.message || 'Reset link sent to your email.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error sending reset link.');
    }
  };

  return (
    <div className="login-container">
      <div className="left-side">
        <h2>Forgot Password?</h2>
        <form onSubmit={handleReset}>
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Send Reset Link</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;
    