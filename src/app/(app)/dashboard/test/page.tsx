"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

export default function TestingHub() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/summary");
      const data = await res.json();
      console.log(data);
      if (res.ok) setDashboardData(data.data);
    } catch (err) {
      console.error("Failed to fetch dashboard");
    }
  };

  const callApi = async (url: string, method: string, body: any) => {
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResponse({ status: res.status, data });
      if (res.ok) {
        toast.success("API Call Successful");
        fetchDashboard();
      } else {
        toast.error("API Call Failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      setResponse({ error: "Network/Fetch Error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Enterprise Trading Test Suite</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Tabs defaultValue="execute">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="execute">Trade</TabsTrigger>
            <TabsTrigger value="reverse">Reverse</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardView data={dashboardData} onRefresh={fetchDashboard} />
          </TabsContent>
          <TabsContent value="execute">
            <TradeForm
              onSubmit={(d) => callApi("/api/trade/execute", "POST", d)}
              loading={loading}
            />
          </TabsContent>
          <TabsContent value="reverse">
            <ReverseForm
              onSubmit={(d) => callApi("/api/trade/reverse", "POST", d)}
              loading={loading}
            />
          </TabsContent>
          <TabsContent value="wallet">
            <WalletForm
              onSubmit={(d) => callApi("/api/wallet/transaction", "POST", d)}
              loading={loading}
            />
          </TabsContent>
        </Tabs>

        {/* RESPONSE VIEWER */}
        <div className="bg-slate-950 p-6 rounded-lg text-white font-mono text-sm overflow-auto h-[600px]">
          <h2 className="text-lg font-bold mb-4 text-green-400">
            API Response Payload
          </h2>
          {response ? (
            <pre>{JSON.stringify(response, null, 2)}</pre>
          ) : (
            <p className="text-gray-500">Perform an action...</p>
          )}
        </div>
      </div>
    </div>
  );
}

// --- FORMS ---

function TradeForm({ onSubmit, loading }: any) {
  const [form, setForm] = useState({
    companyName: "",
    quantity: 0,
    rate: 0,
    commissionType: "FIXED", // Matches API expectation
    commissionValue: 0, // Matches API expectation
    actionType: "BUY",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Execute Trade</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Company Name</Label>
          <Input
            placeholder="AAPL"
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Quantity</Label>
            <Input
              type="number"
              onChange={(e) =>
                setForm({ ...form, quantity: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <Label>Rate</Label>
            <Input
              type="number"
              onChange={(e) =>
                setForm({ ...form, rate: Number(e.target.value) })
              }
            />
          </div>
        </div>

        {/* COMMISSION SETTINGS */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Commission Type</Label>
            <Select
              onValueChange={(v) => setForm({ ...form, commissionType: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="FIXED" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FIXED">FIXED</SelectItem>
                <SelectItem value="PERCENTAGE">PERCENTAGE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Commission Value</Label>
            <Input
              type="number"
              placeholder="0"
              onChange={(e) =>
                setForm({ ...form, commissionValue: Number(e.target.value) })
              }
            />
          </div>
        </div>

        <div>
          <Label>Action Type</Label>
          <Select onValueChange={(v) => setForm({ ...form, actionType: v })}>
            <SelectTrigger>
              <SelectValue placeholder="BUY" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BUY">BUY</SelectItem>
              <SelectItem value="SELL">SELL</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          className="w-full"
          disabled={loading}
          onClick={() => onSubmit(form)}
        >
          Execute Trade
        </Button>
      </CardContent>
    </Card>
  );
}
function ReverseForm({ onSubmit, loading }: any) {
  const [txId, setTxId] = useState("");
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reverse Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <Label>Transaction ID (Reference)</Label>
        <Input
          className="mt-2"
          placeholder="Copy ID from Response Viewer"
          onChange={(e) => setTxId(e.target.value)}
        />
        <Button
          className="mt-4 w-full"
          variant="destructive"
          disabled={loading}
          onClick={() => onSubmit({ transactionId: txId })}
        >
          Reverse Transaction
        </Button>
      </CardContent>
    </Card>
  );
}

function WalletForm({ onSubmit, loading }: any) {
  const [form, setForm] = useState({ amount: 0, actionType: "DEPOSIT" });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Transaction</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="number"
          placeholder="Amount"
          onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
        />
        <Select onValueChange={(v) => setForm({ ...form, actionType: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DEPOSIT">DEPOSIT</SelectItem>
            <SelectItem value="WITHDRAW">WITHDRAW</SelectItem>
          </SelectContent>
        </Select>
        <Button
          className="w-full"
          disabled={loading}
          onClick={() => onSubmit(form)}
        >
          Proceed Transaction
        </Button>
      </CardContent>
    </Card>
  );
}

function DashboardView({ data, onRefresh }: any) {
  if (!data) return <p>Loading dashboard...</p>;
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Portfolio Audit</CardTitle>
        <Button size="sm" variant="outline" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">Net Worth</p>
          <p className="text-xl font-bold">${data.overview.netWorth}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-500">Cash Balance</p>
            <p className="font-semibold">${data.overview.cashBalance}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-500">Comm. Paid</p>
            <p className="font-semibold">
              ${data.analytics.totalCommissionPaid}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
