import React, { useState } from 'react';
import { Button, TextField, Typography, CircularProgress } from '@mui/material';

export default function LoginSignup({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // Helper to check email domain
  const getUserType = (email) => {
    if (email.endsWith('@kongu.ac.in')) return 'Teacher';
    if (email.endsWith('@kongu.edu')) return 'Student';
    return null;
  };

  // Send OTP via backend API
  const sendOtp = async () => {
    setLoading(true);
    setError('');
    setInfo('');
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setInfo('OTP sent to your email.');
        setMode('otp');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and set password via backend API
  const verifyOtp = async () => {
    setLoading(true);
    setError('');
    setInfo('');
    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setInfo('Signup complete! You can now login.');
        setMode('login');
        setEmail('');
        setOtp('');
        setPassword('');
      } else {
        // Show specific error for duplicate email
        if (response.status === 409 && data.error) {
          setError(data.error);
        } else {
          setError(data.error || 'Verification failed');
        }
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  // Simulate login with real API call
  const handleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/login-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setInfo('Login successful!');
        onLogin(data.user); // Pass user data to parent
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle signup (send OTP)
  const handleSignup = async () => {
    setLoading(true);
    setError('');
    setInfo('');
    if (!getUserType(email)) {
      setLoading(false);
      setError('Email must be @kongu.ac.in (Teacher) or @kongu.edu (Student)');
      return;
    }
    // no longer require password here
    await sendOtp();
  };

  const LoadingSpinner = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-white text-center">
            Kongu University
          </h1>
          <p className="text-blue-100 text-center mt-1 text-sm sm:text-base">Academic Portal</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-50 border-b">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-3 px-4 sm:px-6 text-sm font-medium transition-all duration-200 ${
              mode === 'login' 
                ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-3 px-4 sm:px-6 text-sm font-medium transition-all duration-200 ${
              mode === 'signup' 
                ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
            }`}
          >
            Signup
          </button>
        </div>

        {/* Form Content */}
        <div className="p-4 sm:p-6">
          {mode === 'login' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-sm sm:text-base"
                />
              </div>
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 sm:py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
              >
                {loading ? <LoadingSpinner /> : 'Login'}
              </button>
            </div>
          )}

          {mode === 'signup' && (
            <>
              <Typography variant="h6">Signup</Typography>
              <TextField
                label="Email"
                fullWidth margin="normal"
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                helperText="Teacher: name@kongu.ac.in, Student: name@kongu.edu"
              />
              <Button onClick={handleSignup} disabled={loading} fullWidth variant="contained" sx={{ mt:2 }}>
                {loading ? <CircularProgress size={24}/> : 'Send OTP'}
              </Button>
            </>
          )}

          {mode === 'otp' && (
            <>
              <Typography variant="h6">Verify OTP & Set Password</Typography>
              <TextField
                label="OTP Code"
                fullWidth margin="normal"
                value={otp}
                onChange={e => setOtp(e.target.value)}
              />
              <TextField
                label="New Password"
                fullWidth margin="normal"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <Button onClick={verifyOtp} disabled={loading} fullWidth variant="contained" sx={{ mt:2 }}>
                {loading ? <CircularProgress size={24}/> : 'Set Password'}
              </Button>
            </>
          )}

          {/* Error and Info Messages */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs sm:text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {info && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs sm:text-sm text-green-700">{info}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}