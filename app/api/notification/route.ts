import { NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { supabaseServer } from "@/lib/supabase/server";
import { z } from "zod";

export async function GET(request: Request) {
    try {
        const supabase = supabaseServer;

        // Fetch the supply_chain_intel table
        console.log("Fetching the supply chain_intel table...");
        const { data: supplyChainIntel } = await supabase
            .from("supply_chain_intel")
            .select("*");

        if (!supplyChainIntel || supplyChainIntel.length === 0) {
            return NextResponse.json({ message: "No supply chain intel found" }, { status: 404 });
        }

        // Process each item in the supply chain intel
        const processedItems = await Promise.all(supplyChainIntel.map(async (item) => {
            // Extract news data
            const newsData = item.news || [];

            // Process each news item
            const processedNews = await Promise.all(newsData.map(async (news: any) => {
                const summary = news.summary;
                const date = news.time;

                // Use generateText to get only sources for the news
                console.log(`Getting sources for news: ${summary}`);

                const { sources } = await generateText({
                    model: google('gemini-1.5-pro', {
                        useSearchGrounding: true,
                    }),
                    prompt: `For this supply chain news: "${summary}" from date ${date}, 
                    what might be the original sources of this information?
                    Only provide the likely sources, no analysis needed.`,
                });

                // Log the sources for each news item
                console.log('Sources for news:', sources);

                // Return processed news item with only sources, not full analysis
                return {
                    ...news,
                    date,
                    summary,
                    generatedSources: sources,
                };
            }));

            return {
                intel_id: item.intel_id,
                node_id: item.node_id,
                created_at: item.created_at,
                processed_news: processedNews,
            };
        }));

        return NextResponse.json(processedItems);
    } catch (error) {
        console.error('Error processing notifications:', error);
        return NextResponse.json({ error: 'Failed to process notifications' }, { status: 500 });
    }
}


