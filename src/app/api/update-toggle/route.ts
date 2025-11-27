import { NextResponse } from "next/server";
import { docClient, TABLES } from "@/lib/aws-clients";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const account_id = body.account_id || "default";
    const status = body.status?.toUpperCase();

    if (!["ON", "OFF"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await docClient.send(
      new PutCommand({
        TableName: TABLES.TOGGLE,
        Item: { toggle_name: String(account_id), status },
      })
    );

    return NextResponse.json({ message: `Updated ${account_id} to ${status}` });
  } catch (error) {
    console.error("Update Toggle Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
