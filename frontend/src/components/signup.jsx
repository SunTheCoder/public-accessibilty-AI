"use client";

import { useState } from 'react';
import { supabase } from '../../supabase';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [avoidStairs, setAvoidStairs] = useState(false);
  const [preferLighting, setPreferLighting] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    // Sign up the user
    const { data: user, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Signup error:', error.message);
      return;
    }

    // Add user preferences and username
    const { error: prefsError } = await supabase
      .from('user_preferences')
      .insert({
        user_id: user.user.id,
        username, // Add username here
        avoid_stairs: avoidStairs,
        prefer_lighting: preferLighting,
      });

    if (prefsError) {
      console.error('Error adding preferences:', prefsError.message);
    } else {
      alert('Signup successful and preferences saved!');
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border rounded p-2"
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border rounded p-2"
        />
      </div>
      <div>
        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="border rounded p-2"
        />
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={avoidStairs}
            onChange={(e) => setAvoidStairs(e.target.checked)}
          />
          Avoid Stairs
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={preferLighting}
            onChange={(e) => setPreferLighting(e.target.checked)}
          />
          Prefer Lighting
        </label>
      </div>
      <button type="submit" className="bg-blue-500 text-white rounded p-2">
        Sign Up
      </button>
    </form>
  );
};

export default Signup;
