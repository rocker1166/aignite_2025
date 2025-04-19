import { supabaseClient } from "../supabase/client";


export const logout = async () => {
  const { data: session } = await supabaseClient.auth.getSession();

  if (!session || !session.session) {
    console.warn('No active session found.');
    window.location.href = '/'; // Redirect anyway
    return;
  }

  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    console.error('Logout failed:', error.message);
  }

  window.location.href = '/';
};