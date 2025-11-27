import { NextResponse } from "next/server";
import { docClient, TABLES, getCrossAccountEC2Client } from "@/lib/aws-clients";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { DescribeInstancesCommand } from "@aws-sdk/client-ec2";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { account_id } = body;

    if (!account_id) {
      return NextResponse.json(
        { error: "account_id required" },
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
        { error: "Account not found. Register it first." },
        { status: 404 }
      );
    }

    const role_arn = accResp.Item.role_arn;

    // 2. Assume Role & Fetch Instances
    const ec2Client = await getCrossAccountEC2Client(role_arn);

    if (!ec2Client) {
      return NextResponse.json(
        { error: "Failed to assume role" },
        { status: 500 }
      );
    }

    const command = new DescribeInstancesCommand({});
    const response = await ec2Client.send(command);
    console.log("Response:", response);
    const instances: any[] = [];
    if (response.Reservations) {
      for (const res of response.Reservations) {
        if (res.Instances) {
          for (const inst of res.Instances) {
            instances.push({
              InstanceId: inst.InstanceId,
              State: inst.State?.Name,
              Type: inst.InstanceType,
              LaunchTime: inst.LaunchTime?.toISOString(),
            });
          }
        }
      }
    }

    return NextResponse.json(instances);
  } catch (error) {
    console.error("Get Instances Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
