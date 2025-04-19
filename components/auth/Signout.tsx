"use client"
import React from 'react'
import { signout } from '@/lib/functions/signout';
import { Button } from '../ui/button';
const SignoutButton = () => {

    const handleGoogleSignup = async () => {
        console.log("Google signup clicked");
        const { error } = await signout();
      
        if (error) {
          console.error("Google signup failed:", error.message);
        }
      };

  return (
    <div>
        <Button onClick={handleGoogleSignup} className="bg-red-700 hover:bg-red-800">
        Sign Out
        </Button>
    </div>
  )
}

export default SignoutButton