import { NextResponse } from "next/server";
import { bedrockClient } from "@/lib/aws-clients";
import { InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { getAllInstances, getLogs } from "@/lib/data-fetchers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body.message;

    // 1. Fetch Context Data
    const [instances, logs] = await Promise.all([
      getAllInstances(),
      getLogs(10), // Fetch last 10 logs
    ]);

    const contextData = `
Current System State:
- Active Instances: ${JSON.stringify(instances, null, 2)}
- Recent Logs: ${JSON.stringify(logs, null, 2)}
    `.trim();

    const systemPrompt = `You are CloudWise Alarm Assistant. Answer questions about AWS EC2 management, costs, and alarms concisely.
    
${contextData}

Use the above context to answer the user's question. If the user asks about instances or logs, refer to the provided JSON data.`;

    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1024,
      temperature: 0.2,
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
    };

    const command = new InvokeModelCommand({
      modelId:
        process.env.BEDROCK_MODEL_ID ||
        "anthropic.claude-3-haiku-20240307-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
    });

    const response = await bedrockClient.send(command);
    const responseBody = new TextDecoder().decode(response.body);
    const result = JSON.parse(responseBody);

    let reply = "";
    if (result.content && Array.isArray(result.content)) {
      reply = result.content[0]?.text || "";
    } else {
      reply = JSON.stringify(result);
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chatbot Error:", error);
    return NextResponse.json({
      reply: `Error calling Bedrock: ${String(error)}`,
    });
  }
}
