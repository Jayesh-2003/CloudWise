import axios from "axios";

// When running in Next.js, we use relative paths starting with /api
const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface Account {
  account_id: string;
  role_arn: string;
  account_name: string;
}

export interface Instance {
  InstanceId: string;
  State: string;
  Type: string;
  LaunchTime: string;
}

export interface Log {
  id: string;
  instance_id: string;
  account_id: string;
  date: string;
  week_number: number;
  hours_saved: number;
  cost_saved: number;
}

export const cloudwiseApi = {
  // Accounts
  registerAccount: async (
    account_id: string,
    role_arn: string,
    name: string
  ) => {
    return api.post("/register-account", { account_id, role_arn, name });
  },
  listAccounts: async () => {
    return api.get<Account[]>("/list-accounts");
  },
  deleteAccount: async (account_id: string) => {
    return api.delete("/delete-account", { data: { account_id } });
  },

  // Instances
  getInstances: async (account_id: string) => {
    return api.post<Instance[]>("/get-instances", { account_id });
  },
  stopInstance: async (account_id: string, instance_id: string) => {
    return api.post("/stop-instance", { account_id, instance_id });
  },
  startInstance: async (account_id: string, instance_id: string) => {
    return api.post("/start-instance", { account_id, instance_id });
  },

  // Toggle
  getToggleStatus: async (account_id: string = "default") => {
    return api.post<{ status: string; account: string }>("/toggle-status", {
      account_id,
    });
  },
  updateToggle: async (status: "ON" | "OFF") => {
    return api.post("/update-toggle", { account_id: "default", status });
  },

  // Logs
  fetchLogs: async () => {
    return api.get<Log[]>("/fetch-logs");
  },

  // Chatbot
  chatbot: async (message: string) => {
    return api.post<{ reply: string }>("/chatbot", { message });
  },
};
