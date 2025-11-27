"use client";

import { useEffect, useState } from "react";
import { cloudwiseApi, Log } from "@/services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, DollarSign, Clock } from "lucide-react";

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data } = await cloudwiseApi.fetchLogs();
      // Sort by date desc
      const sorted = data.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setLogs(sorted);
    } catch (error) {
      console.error("Failed to fetch logs", error);
    } finally {
      setLoading(false);
    }
  };

  const totalSavings = logs.reduce(
    (acc, log) => acc + (Number(log.cost_saved) || 0),
    0
  );
  const totalHours = logs.reduce(
    (acc, log) => acc + (Number(log.hours_saved) || 0),
    0
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Savings Logs</h1>
        <p className="text-gray-400">
          History of automated actions and cost savings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-900/40 border-white/10 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Cost Saved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400 flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              {totalSavings.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/40 border-white/10 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Hours Saved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400 flex items-center gap-2">
              <Clock className="w-6 h-6" />
              {totalHours.toFixed(1)} h
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-900/40 border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            Activity Log
          </CardTitle>
          <CardDescription className="text-gray-400">
            Detailed record of every instance stopped by CloudWise.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-gray-400">Date</TableHead>
                <TableHead className="text-gray-400">Instance ID</TableHead>
                <TableHead className="text-gray-400">Account</TableHead>
                <TableHead className="text-gray-400">Hours Saved</TableHead>
                <TableHead className="text-gray-400">Cost Saved</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-12 text-gray-400"
                  >
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-500" />
                    Loading logs...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-12 text-gray-400"
                  >
                    No activity recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow
                    key={log.id}
                    className="border-white/10 hover:bg-white/5"
                  >
                    <TableCell className="text-gray-300">
                      {new Date(log.date).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-white font-medium">
                      {log.instance_id}
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {log.account_id}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {log.hours_saved}
                    </TableCell>
                    <TableCell className="text-green-400 font-medium">
                      ${Number(log.cost_saved).toFixed(2)}
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
