import { NextResponse } from "next/server";
import { docClient, TABLES, getCrossAccountEC2Client } from "@/lib/aws-clients";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { StopInstancesCommand } from "@aws-sdk/client-ec2";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { account_id, instance_id } = body;

    if (!account_id || !instance_id) {
      return NextResponse.json(
        { error: "account_id and instance_id are required" },
        { status: 400 }
      );
    }

    // 1. Get Role ARN from DB
    const accResp = await docClient.send(
      new GetCommand({
        TableName: TABLES.ACCOUNTS,
        Key: { account_id },
      })
    );

    if (!accResp.Item) {
      return NextResponse.json(
        { error: "Account not found." },
        { status: 404 }
      );
    }

    const role_arn = accResp.Item.role_arn;

    // 2. Assume Role & Get Client
    const ec2Client = await getCrossAccountEC2Client(role_arn);

    if (!ec2Client) {
      return NextResponse.json(
        { error: "Failed to assume role" },
        { status: 500 }
      );
    }

    // 3. Stop Instance
    const command = new StopInstancesCommand({
      InstanceIds: [instance_id],
    });

    await ec2Client.send(command);

    return NextResponse.json({
      success: true,
      message: `Instance ${instance_id} stopping...`,
    });
  } catch (error) {
    console.error("Stop Instance Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
