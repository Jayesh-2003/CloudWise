"use client";

import { useEffect, useState } from "react";
import { cloudwiseApi, Account, Instance } from "@/services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Server, Power, RefreshCw, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InstancesPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingAccounts, setFetchingAccounts] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      fetchInstances(selectedAccount);
    }
  }, [selectedAccount]);

  const fetchAccounts = async () => {
    try {
      const { data } = await cloudwiseApi.listAccounts();
      setAccounts(data);
      if (data.length > 0) {
        setSelectedAccount(data[0].account_id);
      }
    } catch (error) {
      console.error("Failed to fetch accounts", error);
      setError("Failed to fetch accounts. Please check your connection.");
    } finally {
      setFetchingAccounts(false);
    }
  };

  const fetchInstances = async (accountId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await cloudwiseApi.getInstances(accountId);
      setInstances(data);
    } catch (error: any) {
      console.error("Failed to fetch instances", error);
      setInstances([]);
      if (error.response?.status === 500) {
        setError(
          "AWS Permission Error: Ensure the 'Ai-agent' user has 'sts:AssumeRole' permission for the target role."
        );
      } else {
        setError("Failed to fetch instances. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const [togglingInstanceId, setTogglingInstanceId] = useState<string | null>(
    null
  );

  const handleToggleInstance = async (
    instanceId: string,
    currentState: string
  ) => {
    if (!selectedAccount) return;

    setTogglingInstanceId(instanceId);
    setError(null);

    const isRunning = currentState.toLowerCase() === "running";
    const action = isRunning ? "stop" : "start";

    try {
      if (isRunning) {
        await cloudwiseApi.stopInstance(selectedAccount, instanceId);
      } else {
        await cloudwiseApi.startInstance(selectedAccount, instanceId);
      }

      // Optimistically update UI
      setInstances((prev) =>
        prev.map((inst) =>
          inst.InstanceId === instanceId
            ? { ...inst, State: isRunning ? "stopping" : "pending" }
            : inst
        )
      );
    } catch (error: any) {
      console.error(`Failed to ${action} instance`, error);
      if (error.response?.status === 500) {
        setError(
          `AWS Permission Error: Ensure 'Ai-agent' has 'ec2:${
            isRunning ? "StopInstances" : "StartInstances"
          }' permission.`
        );
      } else {
        setError(`Failed to ${action} instance. Please try again.`);
      }
    } finally {
      setTogglingInstanceId(null);
    }
  };

  const getStatusColor = (state: string) => {
    switch (state?.toLowerCase()) {
      case "running":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "stopped":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      case "stopping":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "pending":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Instance Monitor
          </h1>
          <p className="text-gray-400">
            View real-time status of EC2 instances across accounts.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="w-[250px] bg-gray-900 border-gray-700 text-white">
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700 text-white">
              {accounts.map((acc) => (
                <SelectItem key={acc.account_id} value={acc.account_id}>
                  {acc.account_name} ({acc.account_id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="bg-gray-900 border-gray-700 hover:bg-gray-800 text-white"
            onClick={() => selectedAccount && fetchInstances(selectedAccount)}
            disabled={loading || !selectedAccount}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      <Card className="bg-gray-900/40 border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-400" />
            EC2 Instances
          </CardTitle>
          <CardDescription className="text-gray-400">
            Showing instances for account:{" "}
            {accounts.find((a) => a.account_id === selectedAccount)
              ?.account_name || selectedAccount}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-gray-400">Instance ID</TableHead>
                <TableHead className="text-gray-400">Type</TableHead>
                <TableHead className="text-gray-400">Launch Time</TableHead>
                <TableHead className="text-gray-400">State</TableHead>
                <TableHead className="text-right text-gray-400">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading || fetchingAccounts ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-12 text-gray-400"
                  >
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                    Fetching instance data...
                  </TableCell>
                </TableRow>
              ) : instances.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-12 text-gray-400"
                  >
                    No instances found in this region/account.
                  </TableCell>
                </TableRow>
              ) : (
                instances.map((inst) => (
                  <TableRow
                    key={inst.InstanceId}
                    className="border-white/10 hover:bg-white/5"
                  >
                    <TableCell className="font-mono text-white font-medium">
                      {inst.InstanceId}
                    </TableCell>
                    <TableCell className="text-gray-300">{inst.Type}</TableCell>
                    <TableCell className="text-gray-400 text-sm">
                      {new Date(inst.LaunchTime).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(inst.State)}>
                        {inst.State.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`${
                          inst.State.toLowerCase() === "running"
                            ? "text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            : "text-green-400 hover:text-green-300 hover:bg-green-900/20"
                        }`}
                        disabled={
                          inst.State.toLowerCase() === "pending" ||
                          inst.State.toLowerCase() === "stopping" ||
                          inst.State.toLowerCase() === "shutting-down" ||
                          inst.State.toLowerCase() === "terminated" ||
                          togglingInstanceId === inst.InstanceId
                        }
                        onClick={() =>
                          handleToggleInstance(inst.InstanceId, inst.State)
                        }
                      >
                        {togglingInstanceId === inst.InstanceId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : inst.State.toLowerCase() === "running" ? (
                          <Power className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
