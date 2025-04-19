import { supabaseClient } from "../supabase/client";

export const loginWithEmailPassword = async (email: string, password: string) => {
  console.log('Starting email and password login process...');
  
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    console.log('An error occurred during the email login process.');
    console.error('Login Error:', error.message);
    return null;
  }

  console.log('Email login successful. Data received:', data);
  return data;
};