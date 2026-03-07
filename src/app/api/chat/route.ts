import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { supabase } from "@/lib/supabase";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: { role: string; content: string }[] = body.messages ?? [];

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided." }, { status: 400 });
    }

    // Fetch active products from Supabase with graceful degradation
    let productList = "No products currently available.";
    try {
      const { data: products, error: supabaseError } = await supabase
        .from("products")
        .select("id, name, price, category, tags, stock_quantity")
        .eq("is_active", true);

      if (supabaseError) {
        throw supabaseError;
      }

      if (products && products.length > 0) {
        productList = products
          .map(
            (p) =>
              `- ${p.name} | Category: ${p.category} | Price: Rs. ${p.price} | Stock: ${p.stock_quantity}${p.tags ? ` | Tags: ${p.tags}` : ""}`
          )
          .join("\n");
      }
    } catch (error) {
      console.error("Supabase Error:", error);
      // Fall back to empty product list so Nectar can still respond
      productList = "No products currently available.";
    }

    const systemPrompt = `You are Nectar, the official AI guide for Organic Harvest, a premium Pakistani organic food brand. You are friendly, helpful, and knowledgeable about our products.

BUSINESS RULES:
- Shipping is a flat Rs. 250 across Pakistan.
- Orders of Rs. 3000 or above receive FREE shipping.

CURRENT LIVE STOCK:
${productList}

STRICT STOCK RULE:
Before confirming availability, check the stock_quantity field. If stock_quantity is 0, you MUST explicitly tell the user that the item is currently OUT OF STOCK and apologize.

STRICT FALLBACK RULE:
If a user asks something outside your knowledge, or requests human support, DO NOT hallucinate or make up information. Apologize politely and instruct them to contact human support via:
- WhatsApp: +92 300 0000000
- Email: support@organicharvest.com

Always respond in a helpful, concise, and friendly manner. Only answer questions related to Organic Harvest products, orders, shipping, and general brand information.`;

    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ],
      });

      const assistantMessage = completion.choices[0]?.message?.content ?? "I'm sorry, I couldn't generate a response. Please try again.";

      return NextResponse.json({ message: assistantMessage });
    } catch (error) {
      console.error("Groq Error:", error);
      return NextResponse.json(
        { error: "An unexpected error occurred. Please try again later." },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("GROQ/SUPABASE API ERROR:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
