import { NextResponse } from "next/server";
import { docClient, TABLES } from "@/lib/aws-clients";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { account_id, role_arn, name } = body;

    if (!account_id || !role_arn) {
      return NextResponse.json(
        { error: "Missing account_id or role_arn" },
        { status: 400 }
      );
    }

    await docClient.send(
      new PutCommand({
        TableName: TABLES.ACCOUNTS,
        Item: {
          account_id,
          role_arn,
          account_name: name || account_id,
        },
      })
    );

    return NextResponse.json({ message: "Account Registered" });
  } catch (error) {
    console.error("Register Account Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
