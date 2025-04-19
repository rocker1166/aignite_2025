import { supabase } from "../supabase/browserClient";
export const signout = async ()=>{


    const {error } = await supabase.auth.signOut()
    //   custom onboarding

    if (error) console.error("OAuth error:", error.message);

    return { error}  
}