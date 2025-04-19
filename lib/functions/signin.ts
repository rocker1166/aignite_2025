import { supabase } from "../supabase/browserClient";

export const OauthSignin = async (provider: 'google' | 'github')=>{


    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: 'http://localhost:3000',
        },
    });
    //   custom onboarding

    if (error) console.error("OAuth error:", error.message);

    return {data, error}  
}