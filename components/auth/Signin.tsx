"use client"
import React, { useState } from 'react';
import { loginWithEmailPassword } from '@/lib/functions/signin';
import { signupWithEmailPassword } from '@/lib/functions/signup';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const SigninPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      let result;
      if (isSignUpMode) {
        result = await signupWithEmailPassword(email, password);
        if (result) {
          console.log('Successfully signed up:', result.user);
          setSuccessMessage('Signup successful! ');
          router.push('/');
          setIsSignUpMode(false);
        } else {
          setError('Signup failed. Email might already be in use or invalid.');
        }
      } else {
        result = await loginWithEmailPassword(email, password);
        if (result) {
          console.log('Successfully signed in:', result.user);
          router.push('/');
        } else {
          setError('Login failed. Please check your credentials.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(`${isSignUpMode ? 'Signup' : 'Signin'} error:`, err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setError(null);
    setSuccessMessage(null);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-slate-900 flex items-center justify-center overflow-hidden">
      {/* Background blurred elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-300 dark:bg-purple-900 opacity-20 blur-3xl"></div>
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-blue-300 dark:bg-blue-900 opacity-20 blur-3xl"></div>

      <div className="relative flex flex-col gap-6 max-w-md w-full p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg rounded-xl border border-white/20 dark:border-slate-700/20">
        <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 text-center">
          {isSignUpMode ? 'Create Account' : 'Sign In'}
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-center mb-4">
          {isSignUpMode ? 'Join our resilience planning platform.' : 'Welcome back to your dashboard.'}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-slate-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-slate-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            {loading ? (isSignUpMode ? 'Creating Account...' : 'Signing In...') : (isSignUpMode ? 'Sign Up' : 'Sign In')}
          </Button>
        </form>
        {error && (
          <div className="text-red-500 text-sm mt-2 text-center">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="text-green-500 text-sm mt-2 text-center">
            {successMessage}
          </div>
        )}
        <div className="text-center mt-3">
          <button
            onClick={toggleMode}
            className="text-blue-500 hover:underline text-sm focus:outline-none"
          >
            {isSignUpMode ? 'Already have an account? Sign In' : 'Don\'t have an account? Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SigninPage;