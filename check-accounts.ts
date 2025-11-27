import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { docClient, TABLES } from "./src/lib/aws-clients";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

async function checkAccounts() {
  try {
    const response = await docClient.send(
      new ScanCommand({ TableName: TABLES.ACCOUNTS })
    );
    console.log("Accounts:", JSON.stringify(response.Items, null, 2));
  } catch (error) {
    console.error("Error scanning accounts:", error);
  }
}

checkAccounts();
