"use client";

import { useEffect, useState } from "react";
import { cloudwiseApi, Account } from "@/services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [newAccount, setNewAccount] = useState({
    account_id: "",
    role_arn: "",
    name: "",
  });

  // Delete Confirmation State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    accountId: string | null;
  }>({
    isOpen: false,
    accountId: null,
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const { data } = await cloudwiseApi.listAccounts();
      setAccounts(data);
    } catch (error) {
      console.error("Failed to fetch accounts", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setIsRegistering(true);
    setError(null);
    try {
      await cloudwiseApi.registerAccount(
        newAccount.account_id,
        newAccount.role_arn,
        newAccount.name
      );
      setNewAccount({ account_id: "", role_arn: "", name: "" });
      fetchAccounts();
      setIsRegisterOpen(false);
    } catch (error: any) {
      console.error("Failed to register account", error);
      if (error.response?.status === 500) {
        setError(
          "AWS Permission Error: Ensure 'Ai-agent' has 'dynamodb:PutItem' permission."
        );
      } else {
        setError("Failed to register account. Please try again.");
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDeleteClick = (accountId: string) => {
    setDeleteConfirmation({ isOpen: true, accountId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.accountId) return;

    try {
      await cloudwiseApi.deleteAccount(deleteConfirmation.accountId);
      setDeleteConfirmation({ isOpen: false, accountId: null });
      alert("Account deleted successfully");
      fetchAccounts();
    } catch (error: any) {
      console.error("Failed to delete account", error);
      const msg = error.response?.data?.error || "Failed to delete account";
      alert(`Error: ${msg}`);
      setDeleteConfirmation({ isOpen: false, accountId: null });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Account Management
          </h1>
          <p className="text-gray-400">
            Register and manage AWS accounts for cross-account access.
          </p>
        </div>

        <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> Register Account
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Register New Account</DialogTitle>
              <DialogDescription className="text-gray-400">
                Add an AWS account ID and the Cross-Account Role ARN to enable
                management.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Account Name
                </label>
                <Input
                  placeholder="e.g. Production"
                  className="bg-gray-800 border-gray-700 text-white"
                  value={newAccount.name}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Account ID
                </label>
                <Input
                  placeholder="123456789012"
                  className="bg-gray-800 border-gray-700 text-white"
                  value={newAccount.account_id}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, account_id: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Role ARN
                </label>
                <Input
                  placeholder="arn:aws:iam::123456789012:role/CloudWiseRole"
                  className="bg-gray-800 border-gray-700 text-white"
                  value={newAccount.role_arn}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, role_arn: e.target.value })
                  }
                />
              </div>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleRegister}
                disabled={isRegistering}
              >
                {isRegistering ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Register Account"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-gray-900/40 border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white">Connected Accounts</CardTitle>
          <CardDescription className="text-gray-400">
            List of accounts CloudWise has access to.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-gray-400">Account Name</TableHead>
                <TableHead className="text-gray-400">Account ID</TableHead>
                <TableHead className="text-gray-400">Role ARN</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-gray-400"
                  >
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading accounts...
                  </TableCell>
                </TableRow>
              ) : accounts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-gray-400"
                  >
                    No accounts registered yet.
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((acc) => (
                  <TableRow
                    key={acc.account_id}
                    className="border-white/10 hover:bg-white/5"
                  >
                    <TableCell className="font-medium text-white">
                      {acc.account_name}
                    </TableCell>
                    <TableCell className="text-gray-300 font-mono">
                      {acc.account_id}
                    </TableCell>
                    <TableCell
                      className="text-gray-400 font-mono text-xs truncate max-w-[300px]"
                      title={acc.role_arn}
                    >
                      {acc.role_arn}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/50">
                        <ShieldCheck className="w-3 h-3 mr-1" /> Connected
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => handleDeleteClick(acc.account_id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmation.isOpen}
        onOpenChange={(open) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this account? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmDelete}
            >
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
