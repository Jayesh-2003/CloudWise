import { NextResponse } from "next/server";
import { docClient, TABLES } from "@/lib/aws-clients";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

export async function GET() {
  try {
    const response = await docClient.send(
      new ScanCommand({
        TableName: TABLES.ACCOUNTS,
      })
    );

    return NextResponse.json(response.Items || []);
  } catch (error) {
    console.error("List Accounts Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
