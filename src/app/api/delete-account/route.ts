import { NextResponse } from "next/server";
import { docClient, TABLES } from "@/lib/aws-clients";
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { account_id } = body;

    if (!account_id) {
      return NextResponse.json(
        { error: "Missing account_id" },
        { status: 400 }
      );
    }

    await docClient.send(
      new DeleteCommand({
        TableName: TABLES.ACCOUNTS,
        Key: {
          account_id,
        },
      })
    );

    return NextResponse.json({ message: "Account Deleted" });
  } catch (error: any) {
    console.error("Delete Account Error:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: error.message || String(error) },
      { status: 500 }
    );
  }
}
