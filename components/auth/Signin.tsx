"use client"
import React from 'react'
import { OauthSignin } from '@/lib/functions/signin';
import { Button } from '../ui/button';
const SigninButton = () => {

    const handleGoogleSignup = async () => {
        console.log("Google signup clicked");
        const { error } = await OauthSignin("google");
      
        if (error) {
          console.error("Google signup failed:", error.message);
        }
      };

  return (
    <div>
        <Button onClick={handleGoogleSignup} className="bg-blue-700 hover:bg-blue-800">
        Signin
        </Button>
    </div>
  )
}

export default SigninButton