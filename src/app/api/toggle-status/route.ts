import { NextResponse } from "next/server";
import { docClient, TABLES } from "@/lib/aws-clients";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const account_id = body.account_id || "default";

    const response = await docClient.send(
      new GetCommand({
        TableName: TABLES.TOGGLE,
        Key: { toggle_name: String(account_id) },
      })
    );

    const status = response.Item?.status || "ON";

    return NextResponse.json({
      status: status.toUpperCase(),
      account: account_id,
    });
  } catch (error) {
    console.error("Toggle Status Error:", error);
    return NextResponse.json({ status: "ON", account: "default" }); // Default fallback
  }
}
