import { supabaseClient } from "@/lib/supabase/client";

/**
 * Inserts a supply chain into Supabase.
 * @param {Object} data - The full supply chain object
 * @returns {Promise<{ success: boolean, data?: any, error?: any }>}
 */
async function insertSupplyChain(data) {
    try {
        const {
            name,
            description = "",
            nodes,
            edges,
            connections,
            organisation,
        } = data;

        const payload = {
            user_id: organisation.id,
            name,
            description,
            nodes,
            edges,
            connections,
            organisation,
        };

        const { data: result, error } = await supabaseClient
            .from("supply_chains")
            .insert([payload])
            .select();

        if (error) {
            console.error("❌ Supabase insert error:", error);
            return { success: false, error };
        }

        return { success: true, data: result };
    } catch (err) {
        console.error("❌ Unexpected error:", err);
        return { success: false, error: err };
    }
}


export default insertSupplyChain;