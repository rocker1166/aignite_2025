import { supabaseClient } from "../supabase/client";

export const signupWithEmailPassword = async (email: string, password: string) => {
  console.log('Starting email and password signup process...');
  
  const { data, error } = await supabaseClient.auth.signUp({
    email: email,
    password: password,
  });

  if (error) {
    console.log('An error occurred during the email signup process.');
    console.error('Signup Error:', error.message);
    return null;
  }

  console.log('Email signup successful. Data received:', data);
  return data;
};