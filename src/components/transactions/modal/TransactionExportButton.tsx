"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useQuery } from "@tanstack/react-query";
import {
  Download,
  FileText,
  FileSpreadsheet,
  Loader2,
  Database,
  FileTerminal,
  ShieldCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/lib/toast-service";
import { TransactionFilters } from "@/hooks/useTransactionsLedger";

// IMPORTANT: Adjust this logo path to perfectly match your project structure
import logo from "../../../../public/logo.png";

interface TransactionExportButtonProps {
  filters: TransactionFilters;
}

type ExportFormat = "pdf" | "excel" | "csv";

export function TransactionExportButton({
  filters,
}: TransactionExportButtonProps) {
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // ==========================================
  // FETCH USER PROFILE CONTEXT
  // ==========================================
  const { data: profileResponse } = useQuery({
    queryKey: ["user-profile-context"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    enabled: isOpen, // Only fetch when the modal is open
  });

  const userProfile = profileResponse?.data || {};

  // Extracting all requested fields from database schema context
  const generatedByName =
    userProfile.name || userProfile.username || "System Administrator";
  const generatedByEmail = userProfile.email || "N/A";
  const generatedByPhone = userProfile.phoneNumber || "N/A";
  const generatedByAddress = userProfile.address || "N/A";
  const generatedByProfession = userProfile.profession || "Financial Analyst";

  const handleExport = async () => {
    setIsLoading(true);

    try {
      // 1. Build query parameters from current filters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (key === "page" || key === "limit") return; // Skip pagination limits
        if (value !== undefined && value !== "" && value !== "ALL") {
          queryParams.append(key, String(value));
        }
      });

      // 2. Request the full unpaginated dataset
      queryParams.append("fetchAll", "true");

      const response = await fetch(
        `/api/transactions?${queryParams.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch export data from the server.");
      }

      const responseData = await response.json();
      const transactions = responseData.data || responseData;

      if (!Array.isArray(transactions) || transactions.length === 0) {
        toast.error({
          title: "Empty Ledger",
          description: "No transaction records found matching your filters.",
        });
        setIsLoading(false);
        return;
      }

      // Calculate Totals for Summary Row
      const totalGross = transactions.reduce(
        (sum, tx) => sum + (Number(tx.grossAmount) || 0),
        0,
      );
      const totalCommission = transactions.reduce(
        (sum, tx) => sum + (Number(tx.commissionAmount) || 0),
        0,
      );
      const totalNetImpact = transactions.reduce(
        (sum, tx) => sum + (Number(tx.netCashImpact) || 0),
        0,
      );

      // 3. Normalize the payload mapping
      const normalizedData = transactions.map((tx: any) => ({
        "Transaction ID": tx._id || "N/A",
        Date: tx.transactionDate
          ? new Date(tx.transactionDate).toLocaleString()
          : "N/A",
        "Action Type": tx.actionType || "N/A",
        "Asset/Company": tx.companyName || "—",
        Status: tx.status || "N/A",
        Quantity: tx.quantity || 0,
        "Rate (USD)": tx.rate || 0,
        "Gross Amount (USD)": tx.grossAmount || 0,
        "Commission (USD)": tx.commissionAmount || 0,
        "Net Impact (USD)": tx.netCashImpact || 0,
      }));

      // Append the total summary to the bottom of the data
      normalizedData.push({
        "Transaction ID": "SUMMARY TOTALS",
        Date: "",
        "Action Type": "",
        "Asset/Company": "",
        Status: "",
        Quantity: "",
        "Rate (USD)": "",
        "Gross Amount (USD)": totalGross,
        "Commission (USD)": totalCommission,
        "Net Impact (USD)": totalNetImpact,
      });

      // Inject Comprehensive User Context Metadata for Excel & CSV formats
      if (format === "excel" || format === "csv") {
        normalizedData.push({
          "Transaction ID": "",
          Date: "",
          "Action Type": "",
          "Asset/Company": "",
          Status: "",
          Quantity: "",
          "Rate (USD)": "",
          "Gross Amount (USD)": "",
          "Commission (USD)": "",
          "Net Impact (USD)": "",
        }); // Empty spacer row
        normalizedData.push({
          "Transaction ID": "--- AUDIT CONTROL METADATA ---",
          Date: `Generated On: ${new Date().toLocaleString()}`,
          "Action Type": `Authorized By: ${generatedByName} (${generatedByProfession})`,
          "Asset/Company": `Email: ${generatedByEmail}`,
          Status: `Phone: ${generatedByPhone}`,
          Quantity: `Address: ${generatedByAddress}`,
          "Rate (USD)": "",
          "Gross Amount (USD)": "",
          "Commission (USD)": "",
          "Net Impact (USD)": "",
        });
      }

      // Route to appropriate formatter
      if (format === "pdf") {
        exportPDF(normalizedData);
      } else if (format === "excel") {
        exportExcel(normalizedData);
      } else if (format === "csv") {
        exportCSV(normalizedData);
      }

      toast.success({
        title: "Extraction Complete",
        description: `Ledger dynamically compiled and downloaded as ${format.toUpperCase()}.`,
      });

      setIsOpen(false);
    } catch (error: any) {
      console.error("[TRANSACTION_EXPORT_ERROR]:", error);
      toast.error({
        title: "Extraction Failed",
        description:
          error.message || "An error occurred during data compilation.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // DATA COMPILATION ENGINES
  // ==========================================

  const exportPDF = (data: any[]) => {
    const doc = new jsPDF({ orientation: "landscape" }); // Landscape is best for large tables

    try {
      const imgSrc =
        typeof logo === "object" && "src" in logo ? logo.src : logo;
      doc.addImage(imgSrc as string, "PNG", 14, 12, 12, 12);
    } catch (error) {
      console.warn(
        "Logo failed to load into PDF. Proceeding with text-only header.",
        error,
      );
    }

    // --- Enterprise Header ---
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("ShareTrack", 30, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("An Enterprise Grade Product by Softwarence LTD", 30, 26);

    // --- Ledger Report Info ---
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Master Transactions Ledger", 14, 42);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 48);

    // --- Dynamic User Identification Matrix ---
    doc.setFontSize(9);
    doc.setTextColor(79, 70, 229); // Indigo-600 accents
    doc.setFont("helvetica", "bold");
    doc.text("AUDIT LOG / GENERATED BY:", 180, 42);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(`User: ${generatedByName} (${generatedByProfession})`, 180, 47);
    doc.text(
      `Contact: ${generatedByEmail} | Phone: ${generatedByPhone}`,
      180,
      52,
    );
    doc.text(`Location: ${generatedByAddress}`, 180, 57);

    // Extract columns and rows for autoTable
    const columns = Object.keys(data[0]);
    // const rows = data.map((obj) => Object.values(obj));
    const rows = data.map((obj) => Object.values(obj).map(String));

    // Generate Table
    autoTable(doc, {
      startY: 64, // Pushed down to handle metadata grid cleanly
      head: [columns],
      body: rows, // TypeScript is now happy with this
      theme: "striped",
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 8 },
      willDrawCell: (data) => {
        // Cast the raw row to string[] so TypeScript allows index access
        const rawRow = data.row.raw as string[];

        if (rawRow && rawRow[0] === "SUMMARY TOTALS") {
          doc.setFont("helvetica", "bold");
          doc.setFillColor(241, 245, 249);
        }
      },
    });
    // --- Enterprise Footer ---
    const finalY = (doc as any).lastAutoTable.finalY || 64;

    if (finalY > 180) {
      doc.addPage();
      (doc as any).lastAutoTable.finalY = 20;
    }

    const footerY = (doc as any).lastAutoTable.finalY + 15;

    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text(
      "Softwarence LTD | UK Custom Software & App Development",
      14,
      footerY,
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(
      "Email: info@softwarence.com  |  Phone: +44 7438 596882",
      14,
      footerY + 6,
    );
    doc.text(
      "Address: Unit 4, Storm 12 Plaza Shopping Centre, 54 St Mary's Rd, Southampton, United Kingdom, SO14 0BH",
      14,
      footerY + 12,
    );
    doc.setTextColor(79, 70, 229);
    doc.text("Website: https://softwarence.com/", 14, footerY + 18);

    doc.save(`Master_Ledger_Export_${Date.now()}.pdf`);
  };

  const exportExcel = (data: any[]) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger");
    XLSX.writeFile(workbook, `Master_Ledger_Export_${Date.now()}.xlsx`);
  };

  const exportCSV = (data: any[]) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Master_Ledger_Export_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ==========================================
  // UI CONFIGURATION OPTIONS
  // ==========================================
  const formatOptions = [
    {
      id: "pdf",
      icon: FileText,
      title: "Cryptographic PDF Report",
      description: "Secure, branded document with Softwarence ledger matrix.",
      iconColor: "text-rose-500",
      activeBg: "bg-rose-500/10",
      activeBorder: "border-rose-500/50",
    },
    {
      id: "excel",
      icon: FileSpreadsheet,
      title: "Structured Excel (.xlsx)",
      description: "Tabular workbook with preserved metric data types.",
      iconColor: "text-emerald-500",
      activeBg: "bg-emerald-500/10",
      activeBorder: "border-emerald-500/50",
    },
    {
      id: "csv",
      icon: FileTerminal,
      title: "Raw CSV Payload",
      description: "Flat comma-separated values for pipeline integration.",
      iconColor: "text-indigo-500",
      activeBg: "bg-indigo-500/10",
      activeBorder: "border-indigo-500/50",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-sm transition-all gap-2 px-5 py-2.5 h-auto text-sm font-semibold rounded-lg outline-none">
          <Download className="h-4 w-4" />
          Export Ledger Matrix
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[460px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 shadow-2xl rounded-xl opacity-100 overflow-hidden p-0 z-[100]">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Database className="h-5 w-5 text-indigo-500" /> Compile Ledger
              Export
            </DialogTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed pr-4">
              Select your required format. The payload will dynamically compile
              the complete dataset matching your currently active search &
              filter matrix.
            </p>
          </DialogHeader>

          {/* Format Selection Matrix */}
          <div className="grid gap-3 py-2">
            {formatOptions.map((opt) => {
              const isActive = format === opt.id;
              const Icon = opt.icon;

              return (
                <div
                  key={opt.id}
                  onClick={() => setFormat(opt.id as ExportFormat)}
                  className={cn(
                    "relative flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all duration-200 group",
                    isActive
                      ? `${opt.activeBg} ${opt.activeBorder} ring-1 ring-inset ring-${opt.iconColor.split("-")[1]}-500/20`
                      : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900",
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 p-2 rounded-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm",
                      opt.iconColor,
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4
                      className={cn(
                        "text-sm font-bold tracking-wide transition-colors",
                        isActive
                          ? "text-slate-900 dark:text-slate-50"
                          : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100",
                      )}
                    >
                      {opt.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      {opt.description}
                    </p>
                  </div>

                  {/* Active Indicator Checkmark */}
                  {isActive && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <ShieldCheck className={cn("h-5 w-5", opt.iconColor)} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <DialogFooter className="mt-8 border-t border-slate-200 dark:border-slate-800/60 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              className="bg-transparent border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel Setup
            </Button>
            <div className="py-2"></div>
            <Button
              onClick={handleExport}
              disabled={isLoading}
              className={cn(
                "font-bold tracking-wide shadow-md transition-all",
                isLoading
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white",
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Compiling...
                </>
              ) : (
                "Initialize Download"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
