import { NextRequest, NextResponse } from "next/server";

const N8N_WEBHOOK_URL =
  "https://impartible-cyanuric-asher.ngrok-free.dev/webhook/73cc5ea3-7518-488b-955e-df5e78ee12b3/chat";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: { role: string; content: string }[] = body.messages ?? [];

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided." },
        { status: 400 }
      );
    }

    // Extract latest user message to send to n8n
    const latestUserMessage = messages
      .filter((m) => m.role === "user")
      .at(-1)?.content ?? "";

    // Use a session ID based on conversation history length
    // so n8n memory tracks the conversation correctly
    const sessionId = `organic-harvest-${messages.length}`;

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatInput: latestUserMessage,
        sessionId: sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook error: ${response.status}`);
    }

    const data = await response.json();

    // n8n returns { output: "..." }
    const assistantMessage =
      data.output ??
      data.text ??
      data.message ??
      "I'm sorry, I couldn't generate a response. Please try again.";

    // Return in same format as before so frontend works unchanged
    return NextResponse.json({ message: assistantMessage });

  } catch (err) {
    console.error("n8n Webhook Error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
