"use client"
import React, { useState } from 'react'
import { loginWithEmailPassword } from '@/lib/functions/signin';
import { signupWithEmailPassword } from '@/lib/functions/signup';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useRouter } from 'next/navigation';

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
    <div className="flex flex-col gap-4 max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold text-center">{isSignUpMode ? 'Sign Up' : 'Sign In'}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="p-2 border rounded-md"
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="p-2 border rounded-md"
        />
        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-700 hover:bg-blue-800"
        >
          {loading ? (isSignUpMode ? 'Signing up...' : 'Signing in...') : (isSignUpMode ? 'Sign Up' : 'Sign In')}
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
      <div className="text-center mt-2">
        <button
          onClick={toggleMode}
          className="text-blue-500 hover:underline text-sm"
        >
          {isSignUpMode ? 'Already have an account? Sign In' : 'No account? Sign Up'}
        </button>
      </div>
    </div>
  );
};

export default SigninPage;