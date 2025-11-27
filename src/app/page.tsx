"use client";

import { useState, useEffect } from "react";
import { cloudwiseApi, Log } from "@/services/api";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import {
  Activity,
  DollarSign,
  Clock,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Cpu,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [status, setStatus] = useState<"ON" | "OFF">("ON");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeInstances: 0,
    savings: 0,
    uptime: 0,
    health: 98,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Fetch Accounts first
        const accountsRes = await cloudwiseApi.listAccounts();
        const accounts = accountsRes.data;

        if (accounts.length === 0) {
          setLoading(false);
          return;
        }

        const primaryAccount = accounts[0].account_id;

        // 2. Fetch other data using the primary account
        const [statusResult, logsResult, instancesResult] =
          await Promise.allSettled([
            cloudwiseApi.getToggleStatus(primaryAccount),
            cloudwiseApi.fetchLogs(),
            cloudwiseApi.getInstances(primaryAccount),
          ]);

        if (statusResult.status === "fulfilled") {
          setStatus(statusResult.value.data.status as "ON" | "OFF");
        } else {
          console.error("Failed to fetch toggle status:", statusResult.reason);
        }

        let totalSavings = 0;
        if (logsResult.status === "fulfilled") {
          totalSavings = logsResult.value.data.reduce(
            (acc: number, log: Log) => acc + (Number(log.cost_saved) || 0),
            0
          );
        } else {
          console.error("Failed to fetch logs:", logsResult.reason);
        }

        let activeInstancesCount = 0;
        if (instancesResult.status === "fulfilled") {
          activeInstancesCount = instancesResult.value.data.filter(
            (i: any) => i.State === "running"
          ).length;
        } else {
          console.error("Failed to fetch instances:", instancesResult.reason);
        }

        // Mock uptime calculation based on logs or just static for demo
        const totalUptime = 720;

        setStats({
          activeInstances: activeInstancesCount,
          savings: totalSavings,
          uptime: totalUptime,
          health: 98,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleToggle = async (newStatus: boolean) => {
    const statusStr = newStatus ? "ON" : "OFF";
    setStatus(statusStr);
    try {
      await cloudwiseApi.updateToggle(statusStr);
    } catch (error) {
      console.error("Failed to update toggle:", error);
      setStatus(status === "ON" ? "OFF" : "ON"); // Revert on error
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-10"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <motion.h1
            className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-gray-300 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Dashboard Overview
          </motion.h1>
          <p className="text-gray-400 mt-2 text-lg">
            Welcome back. Here's your cloud infrastructure status.
          </p>
        </div>

        <motion.div
          className="glass px-6 py-3 rounded-2xl flex items-center gap-4 border border-white/10 shadow-lg"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
              Auto-Stop System
            </span>
            <span
              className={`text-sm font-bold ${
                status === "ON"
                  ? "text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]"
                  : "text-gray-500"
              }`}
            >
              {status === "ON" ? "ACTIVE" : "PAUSED"}
            </span>
          </div>
          <ToggleSwitch checked={status === "ON"} onChange={handleToggle} />
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Instances"
          value={stats.activeInstances.toString()}
          icon={Cpu}
          trend="+2"
          trendUp={true}
          color="blue"
          delay={0}
        />
        <StatCard
          title="Est. Monthly Savings"
          value={`$${stats.savings.toFixed(2)}`}
          icon={DollarSign}
          trend="+12%"
          trendUp={true}
          color="green"
          delay={0.1}
        />
        <StatCard
          title="Uptime Hours"
          value={`${stats.uptime}h`}
          icon={Clock}
          trend="99.9%"
          trendUp={true}
          color="purple"
          delay={0.2}
        />
        <StatCard
          title="System Health"
          value={`${stats.health}%`}
          icon={Activity}
          trend="Stable"
          trendUp={true}
          color="pink"
          delay={0.3}
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Savings Trend Chart */}
        <motion.div
          variants={item}
          className="lg:col-span-2 glass-card p-8 min-h-[450px] flex flex-col relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap className="w-32 h-32 text-blue-500" />
          </div>

          <div className="flex justify-between items-center mb-8 relative z-10">
            <div>
              <h2 className="text-2xl font-bold text-white">Savings Trend</h2>
              <p className="text-sm text-gray-400">
                Daily cost reduction analysis
              </p>
            </div>
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-gray-300 outline-none focus:border-blue-500/50">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>

          <div className="flex-1 flex items-end justify-between gap-4 px-2 pb-2 relative z-10">
            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col justify-end group/bar h-full"
              >
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 1.5, delay: i * 0.1, type: "spring" }}
                  className="w-full bg-gradient-to-t from-blue-600/20 via-blue-500/40 to-blue-400/60 rounded-t-lg relative hover:from-blue-600/40 hover:via-blue-500/60 hover:to-blue-400/80 transition-all cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]"
                >
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/bar:translate-y-0 bg-gray-900/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 whitespace-nowrap z-20 shadow-xl">
                    ${h * 5} Saved
                    <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900/90 rotate-45 border-r border-b border-white/10"></div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-6 text-sm text-gray-400 border-t border-white/5 pt-4 font-medium">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          variants={item}
          className="glass-card p-0 flex flex-col overflow-hidden"
        >
          <div className="p-6 border-b border-white/5 bg-white/5">
            <h2 className="text-xl font-bold text-white">Recent Actions</h2>
            <p className="text-xs text-gray-400 mt-1">
              Automated system events
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-white/10 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/30 group-hover:border-green-500/50 transition-colors">
                  <Zap className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate group-hover:text-green-400 transition-colors">
                    Instance Stopped
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    i-0a1b2c3d4e • 2h ago
                  </p>
                </div>
                <div className="text-right">
                  <span className="block text-sm text-green-400 font-mono font-bold">
                    +$0.45
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wide">
                    Saved
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-4 border-t border-white/5 bg-white/5">
            <button className="w-full py-3 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 transition-all text-sm font-bold border border-blue-500/20 hover:border-blue-500/40 flex items-center justify-center gap-2 group">
              View All Activity
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  color,
  delay,
}: any) {
  const colors = {
    blue: "from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/20",
    green:
      "from-emerald-500/20 to-green-500/20 text-emerald-400 border-emerald-500/20",
    purple:
      "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/20",
    pink: "from-pink-500/20 to-rose-500/20 text-pink-400 border-pink-500/20",
  };

  return (
    <motion.div
      variants={{
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 },
      }}
      className="glass-card p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
    >
      <div
        className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}
      >
        <Icon className="w-24 h-24" />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div
            className={`p-3 rounded-xl bg-gradient-to-br ${
              colors[color as keyof typeof colors]
            } border`}
          >
            <Icon className="w-6 h-6" />
          </div>
          <div
            className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg bg-white/5 border border-white/5 ${
              trendUp ? "text-green-400" : "text-red-400"
            }`}
          >
            {trendUp ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {trend}
          </div>
        </div>

        <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      </div>
    </motion.div>
  );
}
