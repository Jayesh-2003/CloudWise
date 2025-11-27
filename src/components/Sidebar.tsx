"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Server,
  Users,
  FileText,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { cloudwiseApi, Log } from "@/services/api";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Accounts", href: "/accounts", icon: Users },
  { name: "Instances", href: "/instances", icon: Server },
  { name: "Logs", href: "/logs", icon: FileText },
  { name: "Assistant", href: "/chat", icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="h-screen w-72 p-4 fixed left-0 top-0 z-[100] flex flex-col"
    >
      <div className="glass h-full rounded-2xl flex flex-col overflow-hidden border border-white/10 shadow-2xl">
        <div className="p-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent neon-text">
            CloudWise
          </h1>
          <p className="text-xs text-gray-400 mt-2 font-medium tracking-wider uppercase">
            Intelligent Cloud Ops
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 group relative overflow-hidden",
                    isActive
                      ? "text-white shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                  <item.icon
                    className={cn(
                      "w-5 h-5 z-10 transition-colors duration-300",
                      isActive
                        ? "text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]"
                        : "group-hover:text-white"
                    )}
                  />
                  <span className="z-10 font-medium tracking-wide">
                    {item.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto">
          <SidebarSavings />
        </div>
      </div>
    </motion.div>
  );
}

function SidebarSavings() {
  const [savings, setSavings] = useState(0);

  useEffect(() => {
    async function fetchSavings() {
      try {
        const { data } = await cloudwiseApi.fetchLogs();
        const total = data.reduce(
          (acc: number, log: Log) => acc + (Number(log.cost_saved) || 0),
          0
        );
        setSavings(total);
      } catch (e) {
        console.error(e);
      }
    }
    fetchSavings();
  }, []);

  return (
    <div className="relative overflow-hidden p-5 rounded-xl border border-white/10 group">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-blue-900/40 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <p className="text-xs text-blue-200 mb-1 font-medium uppercase tracking-wider">
          Total Savings
        </p>
        <p className="text-2xl font-bold text-white neon-text">
          ${savings.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
