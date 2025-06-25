import { supabaseClient } from "@/lib/supabase/client";

const getUserData = async () => {
  try {
    // console.log("Fetching session data...");
    const { data } = await supabaseClient.auth.getSession();
    // console.log("Session data fetched:", data);

    // console.log("Fetching user details...");
    const userdetails = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', data?.session?.user?.id);
    // console.log("User details fetched:", userdetails);

    if (userdetails && userdetails.data && userdetails.data.length > 0) {
      // console.log("User data found:", userdetails.data[0]);
      return userdetails.data[0];
    } else {
      console.log("No user data found.");
    }
  } catch (err) {
    console.log("Error occurred while fetching user data:", err);
  }
};

export { getUserData };

const updateUserData = async (data: any) => {
  try {
    const { error } = await supabaseClient
      .from('users')
      .update({
        organisation_name: data.organisation_name,
        location: data.location,
        employee_count: data.employee_count,
        industry: data.industry,
        sub_industry: data.industry,
        description: data.description
      })
      .eq('id', data.id);
    if (error) {
      throw error;
    }
    return;
  } catch (error) {
    console.log('error is ', error);
    throw error;
  }
};

export { updateUserData };