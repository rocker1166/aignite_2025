import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { supabaseServer } from "@/lib/supabase/server";
import { z } from "zod";

const notificationSchema = z.object({
    title: z.string().describe("A concise, attention-grabbing title for the notification"),
    message: z.string().describe("A detailed message about the supply chain alert or notification"),
    severity: z.enum(["high", "medium", "low"]).describe("The severity level of the notification"),
    notification_type: z.enum(["alert", "warning", "info", "success"]).describe("The type/category of notification"),
    sources: z.array(
        z.object({
            name: z.string().describe("Source name (e.g., Reuters, Bloomberg)"),
            url: z.string().describe("URL to the source"),
        })
    ).optional().describe("Sources that provide evidence or context for this notification")
});

function filterIntelByGeneratedSources(data) {
    // Check if the input is a valid array
    if (!Array.isArray(data)) {
        console.error("Input must be an array.");
        return []; // Return empty array or handle error as needed
    }

    // Use the filter method on the main data array
    const filteredData = data.filter(intelItem => {
        // Check if the intelItem has a 'news' array property
        if (!Array.isArray(intelItem.news)) {
            return false; // If no 'news' array, it can't meet the condition
        }

        // Use the 'some' method to check if AT LEAST ONE news item
        // meets the condition
        return intelItem.news.some(newsItem => {
            // Check if the newsItem has 'generatedSources', if it's an array,
            // and if its length is greater than 0.
            // Optional chaining (?.) safely handles cases where generatedSources might be missing.
            return newsItem.generatedSources?.length > 0;
        });
    });

    return filteredData;
}

/**
 * Generate a notification using AI based on supply chain intel data
 */
/**
 * Generate a notification using AI based on supply chain intel data
 */
async function generateAINotification(nodeData, newsItem) {
    try {
        // Format the sources to match the schema
        const formattedSources = newsItem.generatedSources?.map(source => ({
            name: source.name || source.source || "Unknown Source",
            url: source.url || source.link || ""
        })) || [];

        // Include the sources in the prompt
        const sourcesText = formattedSources.length > 0
            ? `Sources: ${formattedSources.map(s => `${s.name} (${s.url})`).join(', ')}`
            : 'No sources available';

        // Check if we have sufficient data to generate a meaningful notification
        if (
            (!nodeData?.name || nodeData.name === 'Unknown node') &&
            (!newsItem?.summary || newsItem.summary.trim() === '') &&
            (!newsItem?.content || newsItem.content.trim() === '')
        ) {
            throw new Error("Insufficient data to generate notification");
        }

        // Prepare content for the AI prompt
        const nodeInfo = nodeData?.name ? `Node name: ${nodeData.name}\nNode type: ${nodeData?.type || 'Unknown type'}` : '';
        const newsInfo = newsItem?.summary ? `News summary: ${newsItem.summary}\n${newsItem?.content || ''}` : '';
        
        // Check if we have enough specific content
        if (!nodeInfo && !newsInfo) {
            throw new Error("Insufficient specific data to generate notification");
        }
        
        const { object: notification } = await generateObject({
            model: google('gemini-1.5-pro'),
            schema: notificationSchema,
            prompt: `Generate a detailed supply chain notification based on this data:
            ${nodeInfo}
            ${newsInfo}
            ${sourcesText}
            
            Create a notification that is informative, actionable, and appropriate for supply chain professionals.
            Use the summary to generate an appropriate title and message.
            Set an appropriate severity level based on the content.
            Determine the notification_type based on the nature of the news.
            Use exactly the provided sources in your response.
            IMPORTANT: Only include SPECIFIC information about ACTUAL supply chain events or issues.
            Do NOT generate generic messages like "No significant disruptions reported" or "Please stay tuned for updates".
            If there's no specific actionable information, throw an error instead.`,
        });
        
        // Validate against generic messages
        const genericPhrases = [
            "no significant disruption",
            "no disruption",
            "stay tuned for",
            "further updates",
            "no issues reported"
        ];
        
        if (genericPhrases.some(phrase => 
            notification.message.toLowerCase().includes(phrase.toLowerCase()) ||
            notification.title.toLowerCase().includes(phrase.toLowerCase()))) {
            throw new Error("Generated notification contains generic messaging");
        }

        // Ensure sources are included in the notification object
        // Replace AI-generated sources with our formatted sources to ensure correctness
        return {
            ...notification,
            sources: formattedSources
        };
    } catch (error) {
        console.error("Error generating AI notification:", error);
        // Fallback to basic notification
        return {
            title: `Supply Chain Alert: ${nodeData?.name || 'Unknown node'}`,
            message: `New update: ${newsItem?.summary || 'New information available'}`,
            severity: "medium",
            notification_type: "alert",
            sources: formattedSources || [],
        };
    }
}
/**
 * Send a notification to the database
 */
async function sendNotification(notification, userId) {
    try {
        const { data, error } = await supabaseServer
            .from("notifications")
            .insert({
                user_id: userId,
                title: notification.title,
                message: notification.message,
                severity: notification.severity,
                notification_type: notification.notification_type,
                citations: notification.sources || [],  // Ensure sources are included
                created_at: new Date().toISOString(),
            });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Error sending notification:", error);
        throw error;
    }
}

export async function GET(request: Request) {
    try {
        const supabase = supabaseServer;
        const notificationPromises = [];

        // 1. Get all users from the database
        const { data: users, error: usersError } = await supabase
            .from("users")
            .select("id");

        if (usersError || !users || users.length === 0) {
            console.error("Error fetching users:", usersError);
            return NextResponse.json({ message: "Error fetching users" }, { status: 500 });
        }

        for (const user of users) {
            // 2. For each user, process their supply chain data
            const { data: supplyChains, error: supplyChainsError } = await supabase
                .from("supply_chains")
                .select("supply_chain_id, name")
                .eq("user_id", user?.id);

            if (supplyChainsError || !supplyChains || supplyChains.length === 0) {
                console.log(`No supply chains found for user ${user.id}`);
                continue; // Skip to the next user
            }

            for (const suppplyChain of supplyChains) {
                // 3. For each supply chain, get intelligence data
                const { data: supplyChainIntel } = await supabase
                    .from("supply_chain_intel")
                    .select("*")
                    .eq("supply_chain_id", suppplyChain.supply_chain_id)
                    .eq("user_id", user?.id);

                if (!supplyChainIntel || supplyChainIntel.length === 0) {
                    console.log(`No intel found for supply chain ${suppplyChain.supply_chain_id}`);
                    continue; // Skip to the next supply chain
                }

                // Filter intel items that have news with generated sources
                const filteredIntel = filterIntelByGeneratedSources(supplyChainIntel);

                if (filteredIntel.length === 0) {
                    console.log(`No intel with sources found for supply chain ${suppplyChain.supply_chain_id}`);
                    continue;
                }

                // Process each intel item to generate notifications
                for (const intel of filteredIntel) {
                    // Get the node details
                    const { data: node } = await supabase
                        .from("nodes")
                        .select("name, type")
                        .eq("node_id", intel.node_id)
                        .single();


                    if (!intel.news || intel.news.length === 0) {
                        console.log(`No news found for intel item ${intel.intel_id}`);
                        continue;
                    }

                    // Filter news items with generated sources
                    const newsWithSources = intel.news.filter(item =>
                        item.generatedSources && item.generatedSources.length > 0
                    );
                    console.log("newsWithSources", newsWithSources)

                    if (newsWithSources.length === 0) {
                        console.log(`No news with generated sources for intel item ${intel.intel_id}`);
                        continue;
                    }

                    // Create AI-generated notification for each news item with generated sources
                    for (const newsItem of newsWithSources) {
                        try {
                            // Push all notification promises to an array to resolve them together
                            notificationPromises.push(
                                generateAINotification(node, newsItem)
                                    .then(notification => ({
                                        notification,
                                        userId: user.id
                                    }))
                            );
                        } catch (error) {
                            console.error("Error generating notification:", error);
                        }
                    }
                }
            }
        }

        // Wait for all notification generation to complete
        const notificationsToSend = await Promise.all(notificationPromises);

        // Send all notifications to the database
        const sendPromises = notificationsToSend.map(item => {
            console.log("Notification to send:", {
                userId: item.userId,
                title: item.notification.title,
                severity: item.notification.severity,
                type: item.notification.notification_type,
                sourcesCount: item.notification.sources?.length || 0,
                sources: item.notification.sources
            });
            // Actually send notifications with sources
            return sendNotification(item.notification, item.userId);
        });

        // Wait for all notifications to be sent
        await Promise.all(sendPromises);

        // Return success response with the number of notifications sent
        return NextResponse.json(
            {
                message: "Notifications processed successfully",
                count: notificationsToSend.length
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error processing notifications:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}