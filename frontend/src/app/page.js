"use client";

import { useState } from 'react';
import { supabase } from '../../supabase';
import Signup from '@/components/signup';

const Login = () => {
  const [isOTP, setIsOTP] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      alert(error.message);
    } else {
      // Redirect or handle successful login
      window.location.href = '/map';  // or wherever you want to redirect
    }
  };

  const handleOTPLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert(error.message);
    else alert('Check your email for the login link!');
  };

  return (
    <div className="space-y-4">
      {isOTP ? (
        <div className="space-y-2">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded p-2 w-full"
          />
          <button 
            onClick={handleOTPLogin}
            className="bg-blue-500 text-white rounded p-2 w-full"
          >
            Send Magic Link
          </button>
        </div>
      ) : (
        <form onSubmit={handleEmailPasswordLogin} className="space-y-2">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded p-2 w-full"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded p-2 w-full"
          />
          <button 
            type="submit"
            className="bg-blue-500 text-white rounded p-2 w-full"
          >
            Login
          </button>
        </form>
      )}
      
      <button 
        onClick={() => setIsOTP(!isOTP)}
        className="text-blue-500 underline"
      >
        {isOTP ? 'Use email/password login' : 'Use magic link login'}
      </button>
      
      <hr />
      <h2 className="text-xl">Or Sign Up</h2>
      <Signup />
    </div>
  );
};

export default function Home() {
  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <h1 className="text-2xl mb-6">Public Transit Accessibility</h1>
      <Login />
    </div>
  );
}
