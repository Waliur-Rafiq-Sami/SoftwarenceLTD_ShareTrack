// "use client";

// import { ApiResponse } from "@/types/ApiResponse";
// import { zodResolver } from "@hookform/resolvers/zod";
// import Link from "next/link";
// import { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { useDebounce } from "usehooks-ts";
// import * as z from "zod";

// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { signUpSchema } from "@/schemas/signUpSchema";
// import ThemeToggle from "@/components/ThemeToggle";
// import { toast } from "@/lib/toast-service";

// export default function SignUpForm() {
//   const [username, setUsername] = useState("");
//   const [usernameMessage, setUsernameMessage] = useState("");
//   const [isCheckingUsername, setIsCheckingUsername] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const debouncedUsername = useDebounce(username, 300);

//   const router = useRouter();
//   const [showPassword, setShowPassword] = useState(false);

//   const form = useForm<z.infer<typeof signUpSchema>>({
//     resolver: zodResolver(signUpSchema),
//     defaultValues: {
//       username: "",
//       email: "",
//       password: "",
//       dateOfBirth: "",
//       phoneNumber: "",
//       address: "",
//       profession: "",
//     },
//   });

//   useEffect(() => {
//     const checkUsernameUnique = async () => {
//       if (debouncedUsername) {
//         setIsCheckingUsername(true);
//         setUsernameMessage("");
//         try {
//           const res = await fetch(
//             `/api/check-username-unique?username=${encodeURIComponent(debouncedUsername)}`,
//           );
//           const data: ApiResponse = await res.json();

//           if (!res.ok) {
//             throw new Error(data.message || "Error checking username");
//           }

//           setUsernameMessage(data.message);
//         } catch (error: any) {
//           setUsernameMessage(error.message || "Error checking username");
//         } finally {
//           setIsCheckingUsername(false);
//         }
//       }
//     };
//     checkUsernameUnique();
//   }, [debouncedUsername]);

//   const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
//     setIsSubmitting(true);
//     try {
//       const res = await fetch("/api/sign-up", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(values),
//       });

//       const data: ApiResponse = await res.json();

//       if (!res.ok) {
//         throw new Error(
//           data.message || "There was a problem with your sign-up.",
//         );
//       }

//       // FIX 1: Store the EMAIL as the identifier, not the username
//       if (typeof window !== "undefined") {
//         sessionStorage.setItem(
//           "ShareTrack_pending_signup_credentials",
//           JSON.stringify({
//             identifier: values.email,
//             password: values.password,
//           }),
//         );
//       }

//       toast.success({
//         title: "Success",
//         description: data.message,
//       });

//       // FIX 2: Pass the email in the URL as a search parameter
//       router.replace(
//         `/verify/${encodeURIComponent(values.username)}?email=${encodeURIComponent(values.email)}`,
//       );
//     } catch (error: any) {
//       console.error("Error during sign-up:", error);
//       toast.error({
//         title: "Sign Up Failed",
//         description: error.message,
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const isUsernameValid = usernameMessage === "Username is unique";

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-background text-foreground px-4 py-10">
//       <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-border/70 bg-card/95 px-8 py-10 shadow-2xl shadow-black/15 backdrop-blur-xl transition-colors duration-300">
//         <div className="absolute right-5 top-5">
//           <ThemeToggle />
//         </div>
//         <div className="space-y-4 pb-6 border-b border-border/50">
//           <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
//             Softwarence LTD
//           </p>
//           <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
//             Create your Share
//             <span className="text-blue-500">Track</span> account
//           </h1>
//           <p className="max-w-xl text-sm leading-7 text-muted-foreground">
//             Welcome to Softwarence LTD. Share your personal details below and
//             start using ShareTrack with a secure, professional signup flow.
//           </p>
//         </div>
//         <Form {...form}>
//           <form
//             onSubmit={form.handleSubmit(onSubmit)}
//             className="space-y-6 mt-6"
//           >
//             <FormField
//               name="username"
//               control={form.control}
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Username</FormLabel>
//                   <div className="relative flex items-center">
//                     <Input
//                       {...field}
//                       onChange={(e) => {
//                         field.onChange(e);
//                         setUsername(e.target.value);
//                       }}
//                       placeholder="john_doe"
//                       className={`pr-10 transition-all duration-200 ${
//                         username && !isCheckingUsername
//                           ? isUsernameValid
//                             ? "border-green-500/50 focus-visible:ring-green-500/30"
//                             : "border-destructive/50 focus-visible:ring-destructive/30"
//                           : ""
//                       }`}
//                     />
//                     <div className="absolute right-3 flex items-center pointer-events-none">
//                       {isCheckingUsername && (
//                         <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
//                       )}
//                       {!isCheckingUsername &&
//                         username &&
//                         (isUsernameValid ? (
//                           <CheckCircle2 className="h-4 w-4 text-green-500 animate-in fade-in zoom-in-75 duration-200" />
//                         ) : (
//                           <XCircle className="h-4 w-4 text-destructive animate-in fade-in zoom-in-75 duration-200" />
//                         ))}
//                     </div>
//                   </div>

//                   {!isCheckingUsername && usernameMessage && (
//                     <div
//                       className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border mt-1.5 transition-all duration-200 animate-in fade-in slide-in-from-top-1 ${
//                         isUsernameValid
//                           ? "bg-green-500/5 text-green-600 dark:text-green-400 border-green-500/20"
//                           : "bg-destructive/5 text-red-500 border-destructive/20"
//                       }`}
//                     >
//                       <span>{usernameMessage}</span>
//                     </div>
//                   )}
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               name="email"
//               control={form.control}
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Email</FormLabel>
//                   <Input
//                     {...field}
//                     name="email"
//                     placeholder="you@company.com"
//                   />
//                   <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
//                     We will send you a verification code
//                   </p>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <div className="grid gap-4 sm:grid-cols-2">
//               <FormField
//                 name="dateOfBirth"
//                 control={form.control}
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Date of Birth</FormLabel>
//                     <Input {...field} type="date" />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 name="phoneNumber"
//                 control={form.control}
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Phone Number</FormLabel>
//                     <Input {...field} type="tel" placeholder="+123 456 7890" />
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>
//             <FormField
//               name="address"
//               control={form.control}
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Address</FormLabel>
//                   <Input
//                     {...field}
//                     placeholder="123 Business St, City, Country"
//                   />
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               name="profession"
//               control={form.control}
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Profession (optional)</FormLabel>
//                   <Input {...field} placeholder="Engineer, Doctor, Farmer" />
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               name="password"
//               control={form.control}
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Password</FormLabel>
//                   <div className="relative">
//                     <Input
//                       type={showPassword ? "text" : "password"}
//                       {...field}
//                       name="password"
//                       className="pr-12"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword((current) => !current)}
//                       className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition hover:text-foreground"
//                       aria-label={
//                         showPassword ? "Hide password" : "Show password"
//                       }
//                     >
//                       {showPassword ? (
//                         <EyeOff className="h-5 w-5" />
//                       ) : (
//                         <Eye className="h-5 w-5" />
//                       )}
//                     </button>
//                   </div>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <Button
//               type="submit"
//               className="w-full py-3 text-base font-semibold shadow-md active:scale-[0.98] transition-transform duration-100"
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? (
//                 <div className="flex items-center justify-center gap-2">
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                   <span>Creating Account...</span>
//                 </div>
//               ) : (
//                 "Sign Up"
//               )}
//             </Button>
//           </form>
//         </Form>
//         <div className="text-center mt-6">
//           <p className="text-sm text-muted-foreground">
//             Already a member?{" "}
//             <Link
//               href="/sign-in"
//               className="text-primary hover:text-primary/80 font-semibold transition-colors duration-200"
//             >
//               Sign in
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDebounce } from "usehooks-ts";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  XCircle,
  Lock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/schemas/signUpSchema";
import ThemeToggle from "@/components/ThemeToggle";
import { toast } from "@/lib/toast-service";

// Dynamically extend your existing schema to add robust password validation parity checks
const localSignUpSchema = signUpSchema
  .extend({
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function SignUpForm() {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debouncedUsername = useDebounce(username, 300);

  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof localSignUpSchema>>({
    resolver: zodResolver(localSignUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      dateOfBirth: "",
      phoneNumber: "",
      address: "",
      profession: "",
    },
  });

  // Watch fields to render instant visual feedback validation updates
  const passwordValue = form.watch("password");
  const confirmPasswordValue = form.watch("confirmPassword");

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (debouncedUsername) {
        setIsCheckingUsername(true);
        setUsernameMessage("");
        try {
          const res = await fetch(
            `/api/check-username-unique?username=${encodeURIComponent(debouncedUsername)}`,
          );
          const data: ApiResponse = await res.json();

          if (!res.ok) {
            throw new Error(data.message || "Error checking username");
          }

          setUsernameMessage(data.message);
        } catch (error: any) {
          setUsernameMessage(error.message || "Error checking username");
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };
    checkUsernameUnique();
  }, [debouncedUsername]);

  const onSubmit = async (values: z.infer<typeof localSignUpSchema>) => {
    setIsSubmitting(true);
    try {
      // Destructure confirmPassword away so your backend payload contract stays perfectly clean
      const { confirmPassword, ...signUpData } = values;

      const res = await fetch("/api/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signUpData),
      });

      const data: ApiResponse = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "There was a problem with your sign-up.",
        );
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "ShareTrack_pending_signup_credentials",
          JSON.stringify({
            identifier: values.email,
            password: values.password,
          }),
        );
      }

      toast.success({
        title: "Success",
        description: data.message,
      });

      router.replace(
        `/verify/${encodeURIComponent(values.username)}?email=${encodeURIComponent(values.email)}`,
      );
    } catch (error: any) {
      console.error("Error during sign-up:", error);
      toast.error({
        title: "Sign Up Failed",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isUsernameValid = usernameMessage === "Username is unique";
  const doPasswordsMatch =
    passwordValue &&
    confirmPasswordValue &&
    passwordValue === confirmPasswordValue;

  return (
    <div className="flex justify-center items-center min-h-screen bg-background text-foreground px-4 py-10">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-border/70 bg-card/95 px-8 py-10 shadow-2xl shadow-black/15 backdrop-blur-xl transition-colors duration-300">
        <div className="absolute right-5 top-5">
          <ThemeToggle />
        </div>
        <div className="space-y-4 pb-6 border-b border-border/50">
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            Softwarence LTD
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Create your Share<span className="text-blue-500">Track</span>{" "}
            account
          </h1>
          <p className="max-w-xl text-sm leading-7 text-muted-foreground">
            Welcome to Softwarence LTD. Share your personal details below and
            start using ShareTrack with a secure, professional signup flow.
          </p>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 mt-6"
          >
            {/* Username */}
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <div className="relative flex items-center">
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setUsername(e.target.value);
                      }}
                      placeholder="john_doe"
                      className={`pr-10 transition-all duration-200 ${
                        username && !isCheckingUsername
                          ? isUsernameValid
                            ? "border-green-500/50 focus-visible:ring-green-500/30"
                            : "border-destructive/50 focus-visible:ring-destructive/30"
                          : ""
                      }`}
                    />
                    <div className="absolute right-3 flex items-center pointer-events-none">
                      {isCheckingUsername && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      {!isCheckingUsername &&
                        username &&
                        (isUsernameValid ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 animate-in fade-in zoom-in-75 duration-200" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive animate-in fade-in zoom-in-75 duration-200" />
                        ))}
                    </div>
                  </div>

                  {!isCheckingUsername && usernameMessage && (
                    <div
                      className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border mt-1.5 transition-all duration-200 animate-in fade-in slide-in-from-top-1 ${
                        isUsernameValid
                          ? "bg-green-500/5 text-green-600 dark:text-green-400 border-green-500/20"
                          : "bg-destructive/5 text-red-500 border-destructive/20"
                      }`}
                    >
                      <span>{usernameMessage}</span>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input {...field} placeholder="you@company.com" />
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                    We will send you a verification code
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date of Birth & Phone Number */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                name="dateOfBirth"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <Input {...field} type="date" />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="phoneNumber"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <Input {...field} type="tel" placeholder="+123 456 7890" />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Address */}
            <FormField
              name="address"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <Input
                    {...field}
                    placeholder="123 Business St, City, Country"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Profession */}
            <FormField
              name="profession"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profession (optional)</FormLabel>
                  <Input {...field} placeholder="Engineer, Doctor, Farmer" />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Primary Password Field */}
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      {...field}
                      placeholder="••••••••"
                      className="pl-9 pr-12 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4.5 w-4.5" />
                      ) : (
                        <Eye className="h-4.5 w-4.5" />
                      )}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password Field with Dynamic Edge Checks */}
            <FormField
              name="confirmPassword"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      {...field}
                      placeholder="••••••••"
                      className={`pl-9 pr-12 transition-all duration-200 ${
                        confirmPasswordValue
                          ? doPasswordsMatch
                            ? "border-green-500/50 focus-visible:ring-green-500/30"
                            : "border-destructive/50 focus-visible:ring-destructive/30"
                          : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                      className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4.5 w-4.5" />
                      ) : (
                        <Eye className="h-4.5 w-4.5" />
                      )}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions Guardrails */}
            <Button
              type="submit"
              className="w-full py-3 text-base font-semibold shadow-md active:scale-[0.98] transition-transform duration-100 mt-2 bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
              disabled={isSubmitting || isCheckingUsername || !isUsernameValid}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Already a member?{" "}
            <Link
              href="/sign-in"
              className="text-primary hover:text-primary/80 font-semibold transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
