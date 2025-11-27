import { NextResponse } from "next/server";
import {
  ec2Local,
  docClient,
  TABLES,
  getCrossAccountEC2Client,
} from "@/lib/aws-clients";
import { StopInstancesCommand } from "@aws-sdk/client-ec2";
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

// This endpoint is designed to be called by SNS via HTTP/S subscription
export async function POST(request: Request) {
  try {
    // SNS sends a specific JSON format. The message is in the 'Message' field.
    // Sometimes it's raw JSON if not using the standard SNS wrapper.
    // We'll try to parse it robustly.
    const body = await request.json();

    // Handle SNS Subscription Confirmation (if needed, though usually manual or auto-confirm)
    if (body.Type === "SubscriptionConfirmation") {
      console.log("SNS Subscription Confirmation URL:", body.SubscribeURL);
      // In a real app, you might auto-visit this URL to confirm.
      return NextResponse.json({
        message: "Subscription Confirmation Received",
      });
    }

    interface SNSMessage {
      Trigger?: {
        Dimensions?: { name: string; value: string }[];
      };
      [key: string]: any;
    }

    let message: SNSMessage = body as SNSMessage;
    if (body.Message) {
      try {
        message = JSON.parse(body.Message);
      } catch {
        // If parsing fails, treat body.Message as string, but we expect JSON for dimensions
        console.warn("Could not parse SNS Message body");
      }
    }

    console.log("SNS Trigger:", message);

    // 1. Check Global Toggle
    const toggleResp = await docClient.send(
      new GetCommand({
        TableName: TABLES.TOGGLE,
        Key: { toggle_name: "default" },
      })
    );

    if (toggleResp.Item?.status !== "ON") {
      console.log("Auto-Stop is OFF. Skipping.");
      return NextResponse.json({ message: "Feature OFF" });
    }

    // 2. Extract Instance ID
    let instanceId = null;
    const dimensions = message.Trigger?.Dimensions || [];
    for (const dim of dimensions) {
      if (dim.name === "InstanceId") {
        instanceId = dim.value;
      }
    }

    if (instanceId) {
      // 3. Stop Instance
      // NOTE: This assumes the instance is in the LOCAL account where this code runs.
      // If the alarm came from another account, we need logic to determine WHICH account.
      // For now, following the Python script's logic which used ec2_local.
      await ec2Local.send(
        new StopInstancesCommand({
          InstanceIds: [instanceId],
        })
      );

      // 4. Log Savings
      const now = new Date();
      // Calculate week number
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const pastDays = Math.floor(
        (now.getTime() - startOfYear.getTime()) / 86400000
      );
      const weekNumber = Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);

      await docClient.send(
        new PutCommand({
          TableName: TABLES.LOG,
          Item: {
            id: uuidv4(),
            instance_id: instanceId,
            account_id: "default",
            date: now.toISOString(),
            week_number: weekNumber,
            hours_saved: 12, // Example
            cost_saved: 0.12, // Example
          },
        })
      );

      console.log(`Stopped ${instanceId}`);
      return NextResponse.json({ message: `Stopped ${instanceId}` });
    }

    return NextResponse.json({ message: "No InstanceId found in alarm" });
  } catch (error) {
    console.error("SNS Webhook Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
