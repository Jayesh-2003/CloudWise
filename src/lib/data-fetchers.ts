import { docClient, TABLES, getCrossAccountEC2Client } from "@/lib/aws-clients";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { DescribeInstancesCommand } from "@aws-sdk/client-ec2";

export async function getAllInstances() {
  try {
    // 1. Get all registered accounts
    const accResp = await docClient.send(
      new ScanCommand({
        TableName: TABLES.ACCOUNTS,
      })
    );

    const accounts = accResp.Items || [];
    const allInstances: any[] = [];

    // 2. For each account, fetch instances
    for (const acc of accounts) {
      try {
        const ec2Client = await getCrossAccountEC2Client(acc.role_arn);
        if (!ec2Client) continue;

        const command = new DescribeInstancesCommand({});
        const response = await ec2Client.send(command);

        if (response.Reservations) {
          for (const res of response.Reservations) {
            if (res.Instances) {
              for (const inst of res.Instances) {
                allInstances.push({
                  AccountId: acc.account_id,
                  AccountName: acc.account_name,
                  InstanceId: inst.InstanceId,
                  State: inst.State?.Name,
                  Type: inst.InstanceType,
                  LaunchTime: inst.LaunchTime?.toISOString(),
                  Tags: inst.Tags?.reduce((acc: any, tag) => {
                    if (tag.Key) acc[tag.Key] = tag.Value;
                    return acc;
                  }, {}),
                });
              }
            }
          }
        }
      } catch (err) {
        console.error(
          `Failed to fetch instances for account ${acc.account_id}:`,
          err
        );
      }
    }

    return allInstances;
  } catch (error) {
    console.error("Error fetching all instances:", error);
    return [];
  }
}

export async function getLogs(limit = 20) {
  try {
    const response = await docClient.send(
      new ScanCommand({
        TableName: TABLES.LOG,
        Limit: limit,
      })
    );

    // Sort by timestamp if available, otherwise return as is
    // Assuming 'timestamp' or 'date' field exists. If not, just returning items.
    return response.Items || [];
  } catch (error) {
    console.error("Error fetching logs:", error);
    return [];
  }
}
