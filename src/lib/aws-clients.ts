import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import { EC2Client } from "@aws-sdk/client-ec2";
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";

const REGION = process.env.AWS_REGION || "us-east-1";

// Initialize Base Clients
const dbClient = new DynamoDBClient({ region: REGION });
export const docClient = DynamoDBDocumentClient.from(dbClient);

export const stsClient = new STSClient({ region: REGION });
export const ec2Local = new EC2Client({ region: REGION });
export const bedrockClient = new BedrockRuntimeClient({ region: REGION });

// Table Names
export const TABLES = {
  LOG: "ec2_savings_log",
  TOGGLE: "ec2_toggle",
  ACCOUNTS: "user_accounts",
};

/**
 * Assumes an IAM Role in a target account and returns an EC2 client for that account.
 */
export async function getCrossAccountEC2Client(
  roleArn: string,
  region: string = REGION
) {
  try {
    const command = new AssumeRoleCommand({
      RoleArn: roleArn,
      RoleSessionName: "CloudWiseDashboardSession",
    });

    const response = await stsClient.send(command);

    if (!response.Credentials) {
      throw new Error("Failed to obtain credentials from AssumeRole");
    }

    return new EC2Client({
      region: region,
      credentials: {
        accessKeyId: response.Credentials.AccessKeyId!,
        secretAccessKey: response.Credentials.SecretAccessKey!,
        sessionToken: response.Credentials.SessionToken,
      },
    });
  } catch (error) {
    console.error(`❌ Error assuming role ${roleArn}:`, error);
    return null;
  }
}
