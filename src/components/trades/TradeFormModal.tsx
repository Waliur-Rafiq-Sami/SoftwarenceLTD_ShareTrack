// "use client";

// import { useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { Landmark, DollarSign, Layers, Calendar, Tag, Loader2, Edit3 } from "lucide-react";
// import { tradeInputSchema, type TradeInputType } from "@/schemas/tradeSchema";

// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { toast } from "@/lib/toast-service";

// interface TradeFormModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   initialData?: any; // Pass the trade object here if editing, null if creating
// }

// export default function TradeFormModal({ isOpen, onClose, initialData }: TradeFormModalProps) {
//   const queryClient = useQueryClient();
//   const isEditing = !!initialData;

//   const form = useForm<TradeInputType>({
//     resolver: zodResolver(tradeInputSchema),
//     defaultValues: {
//       instrument: "",
//       tradeType: "BUY",
//       quantity: 0,
//       rate: 0,
//       commission: 0,
//       transactionDate: new Date().toISOString().split("T")[0],
//     },
//   });

//   // Populate form when initialData changes (Edit Mode)
//   useEffect(() => {
//     if (initialData && isOpen) {
//       form.reset({
//         instrument: initialData.instrument,
//         tradeType: initialData.tradeType,
//         quantity: initialData.quantity,
//         rate: initialData.rate,
//         commission: initialData.commission,
//         // Ensure date is formatted correctly for the <input type="date">
//         transactionDate: new Date(initialData.transactionDate).toISOString().split("T")[0],
//       });
//     } else if (!initialData && isOpen) {
//       // Reset to defaults for Create Mode
//       form.reset({
//         instrument: "",
//         tradeType: "BUY",
//         quantity: 0,
//         rate: 0,
//         commission: 0,
//         transactionDate: new Date().toISOString().split("T")[0],
//       });
//     }
//   }, [initialData, isOpen, form]);

//   const { mutate, isPending } = useMutation({
//     mutationFn: async (values: TradeInputType) => {
//       const url = isEditing ? `/api/trades/${initialData._id}` : "/api/trades";
//       const method = isEditing ? "PUT" : "POST"; // Dynamic method resolution

//       const response = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(values),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => null);
//         throw new Error(errorData?.message || `Failed to ${isEditing ? "update" : "commit"} trade execution record`);
//       }
//       return response.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["trade-registry"] });

//       toast.success({
//         title: isEditing ? "Record Updated Successfully" : "Execution Logged Successfully",
//         description: "Ledger balances synchronized dynamically.",
//       });

//       onClose(); // Close the modal on success
//     },
//     onError: (error: Error) => {
//       toast.error({
//         title: "Transaction Rejected",
//         description: error.message,
//       });
//     },
//   });

//   return (
//     <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
//       <DialogContent className="sm:max-w-[460px] border border-slate-800 bg-slate-950 text-slate-50 shadow-2xl rounded-xl opacity-100 overflow-hidden p-0 z-[100]">
//         <div className="p-6">
//           <DialogHeader className="mb-4">
//             <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
//               {isEditing ? (
//                 <>
//                   <Edit3 className="h-5 w-5 text-emerald-500" /> Update Asset Trade
//                 </>
//               ) : (
//                 <>
//                   <Landmark className="h-5 w-5 text-blue-500" /> Log Asset Trade
//                 </>
//               )}
//             </DialogTitle>
//           </DialogHeader>

//           <Form {...form}>
//             <form onSubmit={form.handleSubmit((data) => mutate(data))} className="space-y-4 pt-2">
//               {/* Instrument Ticker Field */}
//               <FormField
//                 control={form.control}
//                 name="instrument"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">Instrument Ticker</FormLabel>
//                     <FormControl>
//                       <div className="relative group">
//                         <Tag className="absolute left-3 top-3 h-4 w-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
//                         <Input
//                           placeholder="E.G. FUWANGCER, GP"
//                           {...field}
//                           className="uppercase pl-9 h-11 font-medium tracking-wide bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-blue-500 transition-all"
//                         />
//                       </div>
//                     </FormControl>
//                     <FormMessage className="text-rose-500 text-xs" />
//                   </FormItem>
//                 )}
//               />

//               {/* Action Type Selection (Fixed Transparency Issue) */}
//               <FormField
//                 control={form.control}
//                 name="tradeType"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">Action Type</FormLabel>
//                     <Select onValueChange={field.onChange} value={field.value}>
//                       <FormControl>
//                         <SelectTrigger className="h-11 bg-slate-900 text-slate-100 border border-slate-800 text-sm font-medium focus:ring-1 focus:ring-blue-500 w-full relative z-10 transition-all">
//                           <SelectValue placeholder="Select type" />
//                         </SelectTrigger>
//                       </FormControl>
//                       {/* Added robust background and z-index to prevent transparency bleed */}
//                       <SelectContent className="bg-slate-950 text-slate-100 border border-slate-800 shadow-2xl min-w-[var(--radix-select-trigger-width)] z-[150] opacity-100">
//                         <SelectItem
//                           value="BUY"
//                           className="font-semibold text-rose-500 focus:bg-rose-500/20 focus:text-rose-400 transition-colors cursor-pointer py-2.5">
//                           BUY (Cash Out / Negative Impact)
//                         </SelectItem>
//                         <SelectItem
//                           value="SELL"
//                           className="font-semibold text-emerald-500 focus:bg-emerald-500/20 focus:text-emerald-400 transition-colors cursor-pointer py-2.5">
//                           SELL (Cash In / Positive Impact)
//                         </SelectItem>
//                       </SelectContent>
//                     </Select>
//                     <FormMessage className="text-rose-500 text-xs" />
//                   </FormItem>
//                 )}
//               />

//               {/* Volumetric Metrics & Temporal Markers Row */}
//               <div className="grid grid-cols-2 gap-4">
//                 <FormField
//                   control={form.control}
//                   name="quantity"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">Volume (Qty)</FormLabel>
//                       <FormControl>
//                         <div className="relative group">
//                           <Layers className="absolute left-3 top-3 h-4 w-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
//                           <Input
//                             type="number"
//                             placeholder="0"
//                             value={field.value === 0 ? "" : field.value}
//                             onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseInt(e.target.value, 10))}
//                             className="pl-9 h-11 bg-slate-900 border-slate-800 text-slate-100 font-semibold focus-visible:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all"
//                           />
//                         </div>
//                       </FormControl>
//                       <FormMessage className="text-rose-500 text-xs" />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="transactionDate"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">Execution Date</FormLabel>
//                       <FormControl>
//                         <div className="relative group">
//                           <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
//                           <Input
//                             type="date"
//                             {...field}
//                             className="pl-9 h-11 bg-slate-900 border-slate-800 text-slate-100 font-medium dark:[color-scheme:dark] focus-visible:ring-blue-500 transition-all"
//                           />
//                         </div>
//                       </FormControl>
//                       <FormMessage className="text-rose-500 text-xs" />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               {/* Financial Capital Column Grid */}
//               <div className="grid grid-cols-2 gap-4 border-t border-slate-800/60 pt-4 mt-2">
//                 <FormField
//                   control={form.control}
//                   name="rate"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">Execution Rate</FormLabel>
//                       <FormControl>
//                         <div className="relative group">
//                           <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
//                           <Input
//                             type="number"
//                             step="0.01"
//                             placeholder="0.00"
//                             value={field.value === 0 ? "" : field.value}
//                             onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))}
//                             className="pl-9 h-11 bg-slate-900 border-slate-800 text-slate-100 font-semibold focus-visible:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all"
//                           />
//                         </div>
//                       </FormControl>
//                       <FormMessage className="text-rose-500 text-xs" />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="commission"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">Broker Commission</FormLabel>
//                       <FormControl>
//                         <div className="relative group">
//                           <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
//                           <Input
//                             type="number"
//                             step="0.01"
//                             placeholder="0.00"
//                             value={field.value === 0 ? "" : field.value}
//                             onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))}
//                             className="pl-9 h-11 bg-slate-900 border-slate-800 text-slate-100 font-semibold focus-visible:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all"
//                           />
//                         </div>
//                       </FormControl>
//                       <FormMessage className="text-rose-500 text-xs" />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               {/* Submission System Trigger */}
//               <Button
//                 type="submit"
//                 className={cn(
//                   "w-full h-12 font-bold tracking-wide text-[15px] mt-6 shadow-md transition-all active:scale-[0.99]",
//                   isPending
//                     ? "bg-slate-800 text-slate-400 cursor-not-allowed"
//                     : isEditing
//                       ? "bg-emerald-600 hover:bg-emerald-500 text-white"
//                       : "bg-blue-600 hover:bg-blue-500 text-white",
//                 )}
//                 disabled={isPending}>
//                 {isPending ? (
//                   <>
//                     <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//                     {isEditing ? "Updating..." : "Syncing to Ledger..."}
//                   </>
//                 ) : isEditing ? (
//                   "Update Record"
//                 ) : (
//                   "Commit Transaction"
//                 )}
//               </Button>
//             </form>
//           </Form>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Landmark,
  DollarSign,
  Layers,
  Calendar,
  Tag,
  Loader2,
  Edit3,
} from "lucide-react";
import { tradeInputSchema, type TradeInputType } from "@/schemas/tradeSchema";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/lib/toast-service";

// 1. Strictly type the Session based on your NextAuth JWT/Session callbacks
export interface SessionUser {
  _id: string;
  username?: string;
  isVerified?: boolean;
}

interface TradeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  sessionUser: SessionUser; // 2. explicitly define the injected session prop
}

export default function TradeFormModal({
  isOpen,
  onClose,
  initialData,
  sessionUser,
}: TradeFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!initialData;

  const form = useForm<TradeInputType>({
    resolver: zodResolver(tradeInputSchema),
    defaultValues: {
      instrument: "",
      tradeType: "BUY",
      quantity: 0,
      rate: 0,
      commission: 0,
      transactionDate: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    if (initialData && isOpen) {
      form.reset({
        instrument: initialData.instrument,
        tradeType: initialData.tradeType,
        quantity: initialData.quantity,
        rate: initialData.rate,
        commission: initialData.commission,
        transactionDate: new Date(initialData.transactionDate)
          .toISOString()
          .split("T")[0],
      });
    } else if (!initialData && isOpen) {
      form.reset({
        instrument: "",
        tradeType: "BUY",
        quantity: 0,
        rate: 0,
        commission: 0,
        transactionDate: new Date().toISOString().split("T")[0],
      });
    }
  }, [initialData, isOpen, form]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: TradeInputType) => {
      // 3. ENTERPRISE GUARD: Pre-flight check.
      // If the token drops or mutates unexpectedly, halt execution immediately.
      if (!sessionUser || !sessionUser._id) {
        throw new Error(
          "Cryptographic context invalid: Session expired. Please refresh.",
        );
      }

      const url = isEditing ? `/api/trades/${initialData._id}` : "/api/trades";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          // Note: NextAuth JWT strategy automatically securely attaches the HttpOnly
          // session cookie here. No manual Authorization header is needed.
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        // Handle server-side 401 Unauthorized explicitly
        if (response.status === 401) {
          throw new Error(
            "Unauthorized: Your session has expired. Please sign in again.",
          );
        }

        throw new Error(
          errorData?.message ||
            `Failed to ${isEditing ? "update" : "commit"} trade execution record`,
        );
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trade-registry"] });

      toast.success({
        title: isEditing
          ? "Record Updated Successfully"
          : "Execution Logged Successfully",
        description: "Ledger balances synchronized dynamically.",
      });

      onClose();
    },
    onError: (error: Error) => {
      toast.error({
        title: "Transaction Rejected",
        description: error.message,
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[460px] border border-slate-800 bg-slate-950 text-slate-50 shadow-2xl rounded-xl opacity-100 overflow-hidden p-0 z-[100]">
        <div className="p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
              {isEditing ? (
                <>
                  <Edit3 className="h-5 w-5 text-emerald-500" /> Update Asset
                  Trade
                </>
              ) : (
                <>
                  <Landmark className="h-5 w-5 text-blue-500" /> Log Asset Trade
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => mutate(data))}
              className="space-y-4 pt-2"
            >
              <FormField
                control={form.control}
                name="instrument"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">
                      Instrument Ticker
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Tag className="absolute left-3 top-3 h-4 w-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                          placeholder="E.G. FUWANGCER, GP"
                          {...field}
                          className="uppercase pl-9 h-11 font-medium tracking-wide bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-blue-500 transition-all"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-rose-500 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tradeType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">
                      Action Type
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 bg-slate-900 text-slate-100 border border-slate-800 text-sm font-medium focus:ring-1 focus:ring-blue-500 w-full relative z-10 transition-all">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-950 text-slate-100 border border-slate-800 shadow-2xl min-w-[var(--radix-select-trigger-width)] z-[150] opacity-100">
                        <SelectItem
                          value="BUY"
                          className="font-semibold text-rose-500 focus:bg-rose-500/20 focus:text-rose-400 transition-colors cursor-pointer py-2.5"
                        >
                          BUY (Cash Out / Negative Impact)
                        </SelectItem>
                        <SelectItem
                          value="SELL"
                          className="font-semibold text-emerald-500 focus:bg-emerald-500/20 focus:text-emerald-400 transition-colors cursor-pointer py-2.5"
                        >
                          SELL (Cash In / Positive Impact)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-rose-500 text-xs" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">
                        Volume (Qty)
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Layers className="absolute left-3 top-3 h-4 w-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                          <Input
                            type="number"
                            placeholder="0"
                            value={field.value === 0 ? "" : field.value}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? 0
                                  : parseInt(e.target.value, 10),
                              )
                            }
                            className="pl-9 h-11 bg-slate-900 border-slate-800 text-slate-100 font-semibold focus-visible:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-rose-500 text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transactionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">
                        Execution Date
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                          <Input
                            type="date"
                            {...field}
                            className="pl-9 h-11 bg-slate-900 border-slate-800 text-slate-100 font-medium dark:[color-scheme:dark] focus-visible:ring-blue-500 transition-all"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-rose-500 text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-800/60 pt-4 mt-2">
                <FormField
                  control={form.control}
                  name="rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">
                        Execution Rate
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={field.value === 0 ? "" : field.value}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? 0
                                  : parseFloat(e.target.value),
                              )
                            }
                            className="pl-9 h-11 bg-slate-900 border-slate-800 text-slate-100 font-semibold focus-visible:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-rose-500 text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="commission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">
                        Broker Commission
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={field.value === 0 ? "" : field.value}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? 0
                                  : parseFloat(e.target.value),
                              )
                            }
                            className="pl-9 h-11 bg-slate-900 border-slate-800 text-slate-100 font-semibold focus-visible:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-rose-500 text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className={cn(
                  "w-full h-12 font-bold tracking-wide text-[15px] mt-6 shadow-md transition-all active:scale-[0.99]",
                  isPending
                    ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                    : isEditing
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                      : "bg-blue-600 hover:bg-blue-500 text-white",
                )}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {isEditing ? "Updating..." : "Syncing to Ledger..."}
                  </>
                ) : isEditing ? (
                  "Update Record"
                ) : (
                  "Commit Transaction"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
