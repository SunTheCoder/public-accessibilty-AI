
"use client";

import { useState } from 'react';
import { supabase } from '../../supabase';

const Login = () => {
  const [email, setEmail] = useState('');

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) console.error(error.message);
    else alert('Check your email for the login link!');
  };

  return (
    <div>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default function Home() {
  return (
    <div>
      <h1>Public Transit Accessibility</h1>
      <Login />
    </div>
  );
}
