// "use client";

// import React, { useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import * as z from "zod";
// import {
//   User,
//   Mail,
//   Briefcase,
//   Phone,
//   Calendar,
//   MapPin,
//   Loader2,
// } from "lucide-react";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { cn } from "@/lib/utils";
// import { toast } from "@/lib/toast-service";

// const profileUpdateSchema = z.object({
//   username: z
//     .string()
//     .min(2, "Identity alias must contain at least 2 characters"),
//   profession: z.string().min(2, "Operational role declaration required"),
//   phoneNumber: z.string().min(8, "Secure line trace string too short"),
//   address: z.string().min(4, "Operational nexus footprint too brief"),
//   dateOfBirth: z.string().min(1, "Temporal birth coordination trace required"),
// });

// type ProfileFormValues = z.infer<typeof profileUpdateSchema>;

// export default function ProfileEditForm({
//   profile,
//   onCompleted,
// }: {
//   profile: any;
//   onCompleted: () => void;
// }) {
//   const queryClient = useQueryClient();
//   const form = useForm<ProfileFormValues>({
//     resolver: zodResolver(profileUpdateSchema),
//     defaultValues: {
//       username: "",
//       profession: "",
//       phoneNumber: "",
//       address: "",
//       dateOfBirth: "",
//     },
//   });

//   useEffect(() => {
//     if (profile) {
//       form.reset({
//         username: profile.username || "",
//         profession: profile.profession || "Developer",
//         phoneNumber: profile.phoneNumber || "",
//         address: profile.address || "",
//         dateOfBirth: profile.dateOfBirth
//           ? new Date(profile.dateOfBirth).toISOString().split("T")[0]
//           : "",
//       });
//     }
//   }, [profile, form]);

//   const mutation = useMutation({
//     mutationFn: async (values: ProfileFormValues) => {
//       const res = await fetch("/api/update", {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(values),
//       });
//       if (!res.ok) throw new Error("Failed to commit attributes.");
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["user-profile-context"] });
//       toast.success({
//         title: "Profile Synchronized",
//         description: "Core attributes securely updated.",
//       });
//       onCompleted();
//     },
//   });

//   return (
//     <Form {...form}>
//       <form
//         onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
//         className="space-y-4"
//       >
//         <div className="space-y-1.5">
//           <label className="font-semibold text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
//             System Anchor Endpoint (Immutable Email)
//           </label>
//           <div className="relative opacity-60">
//             <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
//             <Input
//               value={profile.email}
//               disabled
//               className="pl-9 h-11 font-mono tracking-wide bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 cursor-not-allowed select-none"
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <FormField
//             control={form.control}
//             name="username"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel className="font-semibold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
//                   User Handle Alias
//                 </FormLabel>
//                 <FormControl>
//                   <div className="relative">
//                     <User className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
//                     <Input
//                       {...field}
//                       className="pl-9 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus-visible:ring-blue-500"
//                     />
//                   </div>
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name="profession"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel className="font-semibold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
//                   Corporate Profile Role
//                 </FormLabel>
//                 <FormControl>
//                   <div className="relative">
//                     <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
//                     <Input
//                       {...field}
//                       className="pl-9 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus-visible:ring-blue-500"
//                     />
//                   </div>
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <FormField
//             control={form.control}
//             name="phoneNumber"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel className="font-semibold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
//                   Secure Comms Line
//                 </FormLabel>
//                 <FormControl>
//                   <div className="relative">
//                     <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
//                     <Input
//                       {...field}
//                       className="pl-9 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus-visible:ring-blue-500"
//                     />
//                   </div>
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name="dateOfBirth"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel className="font-semibold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
//                   Temporal Record Node (DOB)
//                 </FormLabel>
//                 <FormControl>
//                   <div className="relative">
//                     <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
//                     <Input
//                       type="date"
//                       {...field}
//                       className="pl-9 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 color-scheme-light dark:[color-scheme:dark] focus-visible:ring-blue-500"
//                     />
//                   </div>
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         </div>

//         <FormField
//           control={form.control}
//           name="address"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel className="font-semibold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
//                 Operational Matrix Physical Nexus
//               </FormLabel>
//               <FormControl>
//                 <div className="relative">
//                   <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
//                   <Input
//                     {...field}
//                     className="pl-9 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus-visible:ring-blue-500"
//                   />
//                 </div>
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <Button
//           type="submit"
//           disabled={mutation.isPending}
//           className="w-full h-11 font-bold tracking-wide text-xs uppercase shadow-md mt-2 bg-blue-600 hover:bg-blue-500 text-white disabled:bg-slate-200 dark:disabled:bg-slate-800"
//         >
//           {mutation.isPending ? (
//             <>
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Synchronizing...
//             </>
//           ) : (
//             "Commit Profile Attributes"
//           )}
//         </Button>
//       </form>
//     </Form>
//   );
// }

"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "usehooks-ts";
import * as z from "zod";
import {
  User,
  Mail,
  Briefcase,
  Phone,
  Calendar,
  MapPin,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast-service";
import { cn } from "@/lib/utils";

const profileUpdateSchema = z.object({
  username: z
    .string()
    .min(2, "Identity alias must contain at least 2 characters"),
  profession: z.string().min(2, "Operational role declaration required"),
  phoneNumber: z.string().min(8, "Secure line trace string too short"),
  address: z.string().min(4, "Operational nexus footprint too brief"),
  dateOfBirth: z.string().min(1, "Temporal birth coordination trace required"),
});

type ProfileFormValues = z.infer<typeof profileUpdateSchema>;

interface ProfileEditFormProps {
  profile: any;
  onCompleted: () => void;
  onValidationChange: (isValid: boolean) => void; // Added validation state reporting link
}

export default function ProfileEditForm({
  profile,
  onCompleted,
  onValidationChange,
}: ProfileEditFormProps) {
  const queryClient = useQueryClient();

  // Real-time unique lookup state trackers
  const [username, setUsername] = useState(profile?.username || "");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const debouncedUsername = useDebounce(username, 300);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      username: "",
      profession: "",
      phoneNumber: "",
      address: "",
      dateOfBirth: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        username: profile.username || "",
        profession: profile.profession || "Developer",
        phoneNumber: profile.phoneNumber || "",
        address: profile.address || "",
        dateOfBirth: profile.dateOfBirth
          ? new Date(profile.dateOfBirth).toISOString().split("T")[0]
          : "",
      });
      setUsername(profile.username || "");
    }
  }, [profile, form]);

  // Live Uniqueness API Handshake Hook
  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (!debouncedUsername) return;

      // Rule: If it matches the current user name string, skip query execution and accept
      if (
        debouncedUsername.toLowerCase() === profile?.username?.toLowerCase()
      ) {
        setUsernameMessage("Username is unique");
        setIsCheckingUsername(false);
        return;
      }

      setIsCheckingUsername(true);
      setUsernameMessage("");
      try {
        const res = await fetch(
          `/api/check-username-unique?username=${encodeURIComponent(debouncedUsername)}`,
        );
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Error checking username");
        setUsernameMessage(data.message);
      } catch (error: any) {
        setUsernameMessage(error.message || "Error checking username");
      } finally {
        setIsCheckingUsername(false);
      }
    };

    checkUsernameUnique();
  }, [debouncedUsername, profile?.username]);

  // Determine aggregate state to report to parent modal layout
  const isUsernameValid =
    usernameMessage === "Username is unique" ||
    username.toLowerCase() === profile?.username?.toLowerCase();

  useEffect(() => {
    // Notify parent to lock or unlock close access bounds
    const canClose = !isCheckingUsername && isUsernameValid;
    onValidationChange(canClose);
  }, [isCheckingUsername, isUsernameValid, onValidationChange]);

  const mutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const res = await fetch("/api/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to commit attributes.");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile-context"] });
      toast.success({
        title: "Profile Synchronized",
        description: "Core attributes securely updated.",
      });
      onCompleted();
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <label className="font-semibold text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
            System Anchor Endpoint (Immutable Email)
          </label>
          <div className="relative opacity-60">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input
              value={profile.email}
              disabled
              className="pl-9 h-11 font-mono tracking-wide bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 cursor-not-allowed select-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* USERNAME WITH DYNAMIC VALIDATION CHECK EMBEDDED */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  User Handle Alias
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setUsername(e.target.value);
                      }}
                      className={cn(
                        "pl-9 pr-10 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus-visible:ring-blue-500",
                        username &&
                          !isCheckingUsername &&
                          (isUsernameValid
                            ? "border-green-500/50 focus-visible:ring-green-500/30"
                            : "border-destructive/50 focus-visible:ring-destructive/30"),
                      )}
                    />
                    <div className="absolute right-3 top-3.5 flex items-center pointer-events-none">
                      {isCheckingUsername && (
                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                      )}
                      {!isCheckingUsername &&
                        username &&
                        (isUsernameValid ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        ))}
                    </div>
                  </div>
                </FormControl>

                {!isCheckingUsername && username && usernameMessage && (
                  <div
                    className={cn(
                      "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border mt-1.5 transition-all duration-200",
                      isUsernameValid
                        ? "bg-green-500/5 text-green-600 dark:text-green-400 border-green-500/20"
                        : "bg-destructive/5 text-red-500 border-destructive/20",
                    )}
                  >
                    <span>{usernameMessage}</span>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="profession"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Corporate Profile Role
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <Input
                      {...field}
                      className="pl-9 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus-visible:ring-blue-500"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Secure Comms Line
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <Input
                      {...field}
                      className="pl-9 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus-visible:ring-blue-500"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Temporal Record Node (DOB)
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    <Input
                      type="date"
                      {...field}
                      className="pl-9 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus-visible:ring-blue-500"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Operational Matrix Physical Nexus
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <Input
                    {...field}
                    className="pl-9 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus-visible:ring-blue-500"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={
            mutation.isPending || !isUsernameValid || isCheckingUsername
          }
          className="w-full h-11 font-bold tracking-wide text-xs uppercase shadow-md mt-2 bg-blue-600 hover:bg-blue-500 text-white disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Synchronizing...
            </>
          ) : (
            "Commit Profile Attributes"
          )}
        </Button>
      </form>
    </Form>
  );
}
