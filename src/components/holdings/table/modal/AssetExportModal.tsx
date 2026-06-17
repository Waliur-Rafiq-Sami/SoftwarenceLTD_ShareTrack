// "use client";

// import React, { useState } from "react";
// import * as XLSX from "xlsx";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import { useQuery } from "@tanstack/react-query";
// import {
//   Download,
//   FileText,
//   FileSpreadsheet,
//   Loader2,
//   Database,
//   FileTerminal,
//   ShieldCheck,
// } from "lucide-react";

// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { toast } from "@/lib/toast-service";

// // Import your logo here
// import logo from "../../../../../public/logo.png";

// interface AssetExportModalProps {
//   asset: any;
//   records: any[];
// }

// type ExportFormat = "pdf" | "excel" | "csv";

// export default function AssetExportModal({
//   asset,
//   records,
// }: AssetExportModalProps) {
//   const [format, setFormat] = useState<ExportFormat>("pdf");
//   const [isLoading, setIsLoading] = useState(false);
//   const [isOpen, setIsOpen] = useState(false);

//   const companyName = asset?.companyName || "Asset";

//   // ==========================================
//   // FETCH USER PROFILE CONTEXT
//   // ==========================================
//   const { data: profileResponse } = useQuery({
//     queryKey: ["user-profile-context"],
//     queryFn: async () => {
//       const res = await fetch("/api/profile");
//       if (!res.ok) throw new Error("Failed to fetch profile");
//       return res.json();
//     },
//     enabled: isOpen,
//   });

//   const userProfile = profileResponse?.data || {};

//   // Extracting all requested fields from database schema context
//   const generatedByName =
//     userProfile.name || userProfile.username || "System Administrator";
//   const generatedByEmail = userProfile.email || "N/A";
//   const generatedByPhone = userProfile.phoneNumber || "N/A";
//   const generatedByAddress = userProfile.address || "N/A";
//   const generatedByProfession = userProfile.profession || "Developer";

//   const handleExport = async () => {
//     setIsLoading(true);

//     await new Promise((resolve) => setTimeout(resolve, 100));

//     try {
//       if (!records || records.length === 0) {
//         toast.error({
//           title: "Empty Ledger",
//           description: `No trade records found to export for ${companyName}.`,
//         });
//         setIsLoading(false);
//         return;
//       }

//       // Format the data using the provided props
//       const normalizedData = records.map((record: any) => ({
//         "Transaction ID": record._id || "N/A",
//         Date: record.transactionDate
//           ? new Date(record.transactionDate).toLocaleString()
//           : "N/A",
//         Action: record.actionType,
//         Status: record.status,
//         Quantity: record.quantity || 0,
//         "Rate (USD)": record.rate || 0,
//         "Gross Amount (USD)": record.grossAmount || 0,
//         "Commission (USD)": record.commissionAmount || 0,
//         "Net Impact (USD)": record.netCashImpact || 0,
//       }));

//       // Append the total summary to the bottom of the data
//       normalizedData.push({
//         "Transaction ID": "SUMMARY TOTALS",
//         Date: "",
//         Action: "",
//         Status: "",
//         Quantity: asset.totalQuantity || 0,
//         "Rate (USD)": asset.avgBuyPrice || 0,
//         "Gross Amount (USD)": "",
//         "Commission (USD)": "",
//         "Net Impact (USD)": asset.totalInvestedAmount || 0,
//       });

//       // Inject Comprehensive User Context Metadata for Excel & CSV formats
//       if (format === "excel" || format === "csv") {
//         normalizedData.push({
//           "Transaction ID": "",
//           Date: "",
//           Action: "",
//           Status: "",
//           Quantity: "",
//           "Rate (USD)": "",
//           "Gross Amount (USD)": "",
//           "Commission (USD)": "",
//           "Net Impact (USD)": "",
//         }); // Empty spacer row
//         normalizedData.push({
//           "Transaction ID": "--- AUDIT CONTROL METADATA ---",
//           Date: `Generated On: ${new Date().toLocaleString()}`,
//           Action: `Authorized By: ${generatedByName} (${generatedByProfession})`,
//           Status: `Email: ${generatedByEmail}`,
//           Quantity: `Phone: ${generatedByPhone}`,
//           "Rate (USD)": `Address: ${generatedByAddress}`,
//           "Gross Amount (USD)": "",
//           "Commission (USD)": "",
//           "Net Impact (USD)": "",
//         });
//       }

//       // Route to appropriate formatter
//       if (format === "pdf") {
//         exportPDF(normalizedData);
//       } else if (format === "excel") {
//         exportExcel(normalizedData);
//       } else if (format === "csv") {
//         exportCSV(normalizedData);
//       }

//       toast.success({
//         title: "Extraction Complete",
//         description: `${companyName} ledger compiled and downloaded as ${format.toUpperCase()}.`,
//       });

//       setIsOpen(false);
//     } catch (error: any) {
//       console.error("[ASSET_EXPORT_ERROR]:", error);
//       toast.error({
//         title: "Extraction Failed",
//         description:
//           error.message || "An error occurred during data compilation.",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ==========================================
//   // DATA COMPILATION ENGINES
//   // ==========================================

//   const exportPDF = (data: any[]) => {
//     const doc = new jsPDF({ orientation: "landscape" });

//     try {
//       const imgSrc =
//         typeof logo === "object" && "src" in logo ? logo.src : logo;
//       doc.addImage(imgSrc as string, "PNG", 14, 12, 12, 12);
//     } catch (error) {
//       console.warn(
//         "Logo failed to load into PDF. Proceeding with text-only header.",
//         error,
//       );
//     }

//     // --- Enterprise Header ---
//     doc.setFontSize(22);
//     doc.setTextColor(15, 23, 42); // slate-900
//     doc.text("ShareTrack", 30, 20);

//     doc.setFontSize(10);
//     doc.setTextColor(100);
//     doc.text("An Enterprise Grade Product by Softwarence LTD", 30, 26);

//     // --- Ledger Report Info ---
//     doc.setFontSize(14);
//     doc.setTextColor(15, 23, 42);
//     doc.text(`${companyName} - Asset Ledger`, 14, 42);

//     doc.setFontSize(9);
//     doc.setTextColor(100);
//     doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 48);

//     // --- Dynamic User Identification Matrix (New Block) ---
//     doc.setFontSize(9);
//     doc.setTextColor(59, 130, 246); // Royal Blue accents
//     doc.setFont("helvetica", "bold");
//     doc.text("AUDIT LOG / GENERATED BY:", 150, 42);

//     doc.setFont("helvetica", "normal");
//     doc.setTextColor(71, 85, 105); // slate-600
//     doc.text(`User: ${generatedByName} (${generatedByProfession})`, 150, 47);
//     doc.text(
//       `Contact: ${generatedByEmail} | Phone: ${generatedByPhone}`,
//       150,
//       52,
//     );
//     doc.text(`Location: ${generatedByAddress}`, 150, 57);

//     // Extract columns and rows for autoTable
//     const columns = Object.keys(data[0]);
//     const rows = data.map((obj) => Object.values(obj));

//     // Generate Table
//     autoTable(doc, {
//       startY: 64, // Pushed down to handle metadata grid cleanly without overlapping
//       head: [columns],
//       body: rows,
//       theme: "striped",
//       headStyles: { fillColor: [15, 23, 42] },
//       styles: { fontSize: 8 },
//       willDrawCell: (data) => {
//         if (data.row.raw && data.row.raw[0] === "SUMMARY TOTALS") {
//           doc.setFont("helvetica", "bold");
//           doc.setFillColor(241, 245, 249);
//         }
//       },
//     });

//     // --- Enterprise Footer ---
//     const finalY = (doc as any).lastAutoTable.finalY || 64;

//     if (finalY > 180) {
//       doc.addPage();
//       (doc as any).lastAutoTable.finalY = 20;
//     }

//     const footerY = (doc as any).lastAutoTable.finalY + 15;

//     doc.setFontSize(11);
//     doc.setTextColor(15, 23, 42);
//     doc.setFont("helvetica", "bold");
//     doc.text(
//       "Softwarence LTD | UK Custom Software & App Development",
//       14,
//       footerY,
//     );

//     doc.setFont("helvetica", "normal");
//     doc.setFontSize(9);
//     doc.setTextColor(100);
//     doc.text(
//       "Email: info@softwarence.com  |  Phone: +44 7438 596882",
//       14,
//       footerY + 6,
//     );
//     doc.text(
//       "Address: Unit 4, Storm 12 Plaza Shopping Centre, 54 St Mary's Rd, Southampton, United Kingdom, SO14 0BH",
//       14,
//       footerY + 12,
//     );
//     doc.setTextColor(59, 130, 246);
//     doc.text("Website: https://softwarence.com/", 14, footerY + 18);

//     doc.save(`ShareTrack_${companyName}_Ledger_${Date.now()}.pdf`);
//   };

//   const exportExcel = (data: any[]) => {
//     const worksheet = XLSX.utils.json_to_sheet(data);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, `${companyName} Ledger`);
//     XLSX.writeFile(
//       workbook,
//       `ShareTrack_${companyName}_Ledger_${Date.now()}.xlsx`,
//     );
//   };

//   const exportCSV = (data: any[]) => {
//     const worksheet = XLSX.utils.json_to_sheet(data);
//     const csv = XLSX.utils.sheet_to_csv(worksheet);
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `ShareTrack_${companyName}_Ledger_${Date.now()}.csv`;
//     a.click();
//     window.URL.revokeObjectURL(url);
//   };

//   // ==========================================
//   // UI CONFIGURATION OPTIONS
//   // ==========================================
//   const formatOptions = [
//     {
//       id: "pdf",
//       icon: FileText,
//       title: "Cryptographic PDF Report",
//       description: "Secure, branded document with Softwarence ledger matrix.",
//       iconColor: "text-rose-500",
//       activeBg: "bg-rose-500/10",
//       activeBorder: "border-rose-500/50",
//     },
//     {
//       id: "excel",
//       icon: FileSpreadsheet,
//       title: "Structured Excel (.xlsx)",
//       description: "Tabular workbook with preserved metric data types.",
//       iconColor: "text-emerald-500",
//       activeBg: "bg-emerald-500/10",
//       activeBorder: "border-emerald-500/50",
//     },
//     {
//       id: "csv",
//       icon: FileTerminal,
//       title: "Raw CSV Payload",
//       description: "Flat comma-separated values for pipeline integration.",
//       iconColor: "text-blue-500",
//       activeBg: "bg-blue-500/10",
//       activeBorder: "border-blue-500/50",
//     },
//   ];

//   return (
//     <Dialog open={isOpen} onOpenChange={setIsOpen}>
//       <DialogTrigger asChild>
//         <button className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-800 outline-none">
//           <Download className="h-4 w-4" />
//           Export Ledger
//         </button>
//       </DialogTrigger>

//       <DialogContent className="sm:max-w-[460px] border border-slate-800 bg-slate-950 text-slate-50 shadow-2xl rounded-xl opacity-100 overflow-hidden p-0 z-[100]">
//         <div className="p-6">
//           <DialogHeader className="mb-6">
//             <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
//               <Database className="h-5 w-5 text-blue-500" /> Compile{" "}
//               {companyName} Export
//             </DialogTitle>
//             <p className="text-xs text-slate-400 mt-1.5 leading-relaxed pr-4">
//               Select your required cryptographic format. The payload will be
//               generated securely using the currently loaded records and asset
//               totals.
//             </p>
//           </DialogHeader>

//           {/* Format Selection Matrix */}
//           <div className="grid gap-3 py-2">
//             {formatOptions.map((opt) => {
//               const isActive = format === opt.id;
//               const Icon = opt.icon;

//               return (
//                 <div
//                   key={opt.id}
//                   onClick={() => setFormat(opt.id as ExportFormat)}
//                   className={cn(
//                     "relative flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all duration-200 group",
//                     isActive
//                       ? `${opt.activeBg} ${opt.activeBorder} ring-1 ring-inset ring-${opt.iconColor.split("-")[1]}-500/20`
//                       : "bg-slate-900/50 border-slate-800 hover:bg-slate-900 hover:border-slate-700",
//                   )}
//                 >
//                   <div
//                     className={cn(
//                       "mt-0.5 p-2 rounded-md bg-slate-950 border border-slate-800 shadow-sm",
//                       opt.iconColor,
//                     )}
//                   >
//                     <Icon className="h-5 w-5" />
//                   </div>
//                   <div className="flex-1 space-y-1">
//                     <h4
//                       className={cn(
//                         "text-sm font-bold tracking-wide",
//                         isActive
//                           ? "text-slate-50"
//                           : "text-slate-300 group-hover:text-slate-100",
//                       )}
//                     >
//                       {opt.title}
//                     </h4>
//                     <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
//                       {opt.description}
//                     </p>
//                   </div>

//                   {/* Active Indicator Checkmark */}
//                   {isActive && (
//                     <div className="absolute right-4 top-1/2 -translate-y-1/2">
//                       <ShieldCheck className={cn("h-5 w-5", opt.iconColor)} />
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>

//           <DialogFooter className="mt-8 border-t border-slate-800/60 pt-4">
//             <Button
//               variant="outline"
//               onClick={() => setIsOpen(false)}
//               disabled={isLoading}
//               className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
//             >
//               Cancel Setup
//             </Button>
//             <div className="py-2"></div>
//             <Button
//               onClick={handleExport}
//               disabled={isLoading}
//               className={cn(
//                 "font-bold tracking-wide shadow-md transition-all",
//                 isLoading
//                   ? "bg-slate-800 text-slate-400 cursor-not-allowed"
//                   : "bg-blue-600 hover:bg-blue-500 text-white",
//               )}
//             >
//               {isLoading ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Compiling...
//                 </>
//               ) : (
//                 "Initialize Download"
//               )}
//             </Button>
//           </DialogFooter>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useQuery } from "@tanstack/react-query";
import { useShareRecordsQuery } from "@/hooks/useShareRecordsQuery"; // Added hook import
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

// Import your logo here
import logo from "../../../../../public/logo.png";

interface AssetExportModalProps {
  asset: any;
}

type ExportFormat = "pdf" | "excel" | "csv";

export default function AssetExportModal({ asset }: AssetExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const companyName = asset?.companyName || "Asset";

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
    enabled: isOpen,
  });

  // ==========================================
  // FULL LEDGER FETCH ENGINE (Independent Query)
  // ==========================================
  const { refetch: fetchAllRecords } = useShareRecordsQuery({
    companyName: asset?.companyName || null,
    page: 1,
    limit: 10000, // Fetch entire transaction log bypass instead of just 5 lines
    sortOrder: "desc",
  });

  const userProfile = profileResponse?.data || {};

  // Extracting all requested fields from database schema context
  const generatedByName =
    userProfile.name || userProfile.username || "System Administrator";
  const generatedByEmail = userProfile.email || "N/A";
  const generatedByPhone = userProfile.phoneNumber || "N/A";
  const generatedByAddress = userProfile.address || "N/A";
  const generatedByProfession = userProfile.profession || "Developer";

  const handleExport = async () => {
    setIsLoading(true);

    try {
      // 1. On demand execution to capture unpaginated master database payload
      const { data: recordsResponse } = await fetchAllRecords();
      const allRecords = recordsResponse?.data || [];

      if (!allRecords || allRecords.length === 0) {
        toast.error({
          title: "Empty Ledger",
          description: `No trade records found to export for ${companyName}.`,
        });
        setIsLoading(false);
        return;
      }

      // 2. Format the complete dataset using the freshly grabbed full arrays
      const normalizedData = allRecords.map((record: any) => ({
        "Transaction ID": record._id || "N/A",
        Date: record.transactionDate
          ? new Date(record.transactionDate).toLocaleString()
          : "N/A",
        Action: record.actionType,
        Status: record.status,
        Quantity: record.quantity || 0,
        "Rate (USD)": record.rate || 0,
        "Gross Amount (USD)": record.grossAmount || 0,
        "Commission (USD)": record.commissionAmount || 0,
        "Net Impact (USD)": record.netCashImpact || 0,
      }));

      // Append the total summary to the bottom of the data matrix
      normalizedData.push({
        "Transaction ID": "SUMMARY TOTALS",
        Date: "",
        Action: "",
        Status: "",
        Quantity: asset.totalQuantity || 0,
        "Rate (USD)": asset.avgBuyPrice || 0,
        "Gross Amount (USD)": "",
        "Commission (USD)": "",
        "Net Impact (USD)": asset.totalInvestedAmount || 0,
      });

      // Inject Comprehensive User Context Metadata for Excel & CSV formats
      if (format === "excel" || format === "csv") {
        normalizedData.push({
          "Transaction ID": "",
          Date: "",
          Action: "",
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
          Action: `Authorized By: ${generatedByName} (${generatedByProfession})`,
          Status: `Email: ${generatedByEmail}`,
          Quantity: `Phone: ${generatedByPhone}`,
          "Rate (USD)": `Address: ${generatedByAddress}`,
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
        description: `${companyName} ledger compiled and downloaded as ${format.toUpperCase()}.`,
      });

      setIsOpen(false);
    } catch (error: any) {
      console.error("[ASSET_EXPORT_ERROR]:", error);
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
    const doc = new jsPDF({ orientation: "landscape" });

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
    doc.text(`${companyName} - Asset Ledger`, 14, 42);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 48);

    // --- Dynamic User Identification Matrix (New Block) ---
    doc.setFontSize(9);
    doc.setTextColor(59, 130, 246); // Royal Blue accents
    doc.setFont("helvetica", "bold");
    doc.text("AUDIT LOG / GENERATED BY:", 150, 42);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(`User: ${generatedByName} (${generatedByProfession})`, 150, 47);
    doc.text(
      `Contact: ${generatedByEmail} | Phone: ${generatedByPhone}`,
      150,
      52,
    );
    doc.text(`Location: ${generatedByAddress}`, 150, 57);

    // Extract columns and rows for autoTable
    const columns = Object.keys(data[0]);
    // const rows = data.map((obj) => Object.values(obj));
    const rows = data.map((obj) => Object.values(obj).map(String));

    // Generate Table
    autoTable(doc, {
      startY: 64, // Pushed down to handle metadata grid cleanly without overlapping
      head: [columns],
      body: rows,
      theme: "striped",
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 8 },
      // willDrawCell: (data) => {
      //   if (data.row.raw && data.row.raw[0] === "SUMMARY TOTALS") {
      //     doc.setFont("helvetica", "bold");
      //     doc.setFillColor(241, 245, 249);
      //   }
      // },
      willDrawCell: (data) => {
        // Cast the raw row to an array of strings so TypeScript knows [0] is safe to access
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
    doc.setTextColor(59, 130, 246);
    doc.text("Website: https://softwarence.com/", 14, footerY + 18);

    doc.save(`ShareTrack_${companyName}_Ledger_${Date.now()}.pdf`);
  };

  const exportExcel = (data: any[]) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${companyName} Ledger`);
    XLSX.writeFile(
      workbook,
      `ShareTrack_${companyName}_Ledger_${Date.now()}.xlsx`,
    );
  };

  const exportCSV = (data: any[]) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ShareTrack_${companyName}_Ledger_${Date.now()}.csv`;
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
      iconColor: "text-blue-500",
      activeBg: "bg-blue-500/10",
      activeBorder: "border-blue-500/50",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-800 outline-none">
          <Download className="h-4 w-4" />
          Export Ledger
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[460px] border border-slate-800 bg-slate-950 text-slate-50 shadow-2xl rounded-xl opacity-100 overflow-hidden p-0 z-[100]">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" /> Compile{" "}
              {companyName} Export
            </DialogTitle>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed pr-4">
              Select your required cryptographic format. The payload will be
              generated securely using the currently loaded records and asset
              totals.
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
                      : "bg-slate-900/50 border-slate-800 hover:bg-slate-900 hover:border-slate-700",
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 p-2 rounded-md bg-slate-950 border border-slate-800 shadow-sm",
                      opt.iconColor,
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4
                      className={cn(
                        "text-sm font-bold tracking-wide",
                        isActive
                          ? "text-slate-50"
                          : "text-slate-300 group-hover:text-slate-100",
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

          <DialogFooter className="mt-8 border-t border-slate-800/60 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
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
                  ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white",
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
