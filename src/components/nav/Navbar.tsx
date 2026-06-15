// "use client";

// import React, { useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useSession, signOut } from "next-auth/react";
// import { LogOut, Landmark } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import ThemeToggle from "@/components/ThemeToggle";
// import { toast } from "@/lib/toast-service";
// import { Skeleton } from "./ui/skeleton";

// // Importing your custom Sonner toast matrix
// export default function Navbar() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const [isLoggingOut, setIsLoggingOut] = useState(false);

//   const handleLogout = async () => {
//     setIsLoggingOut(true);
//     try {
//       await signOut({ redirect: false });
//       toast.success({
//         title: "Signed out successfully",
//         description: "Thank you for using Trade Ledger.",
//       });
//       router.push("/sign-in");
//       router.refresh();
//     } catch (error) {
//       toast.error({
//         title: "Unable to sign out",
//         description: "Something went wrong. Please try again.",
//       });
//     } finally {
//       setIsLoggingOut(false);
//     }
//   };

//   return (
//     <nav className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-md shadow-sm transition-colors duration-300">
//       <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between relative">
//         {/* LEFT SIDE - Logo (and Title on Mobile) */}
//         <div className="flex items-center gap-3 flex-1 md:flex-none">
//           <div className="bg-blue-500/10 p-2 rounded-xl border border-blue-500/20 shadow-inner">
//             {/* You can replace Landmark with your actual image/logo */}
//             <Landmark className="h-5 w-5 text-blue-500" />
//           </div>
//           {/* Mobile Title - Hidden on medium screens and up */}
//           <Link
//             href="/"
//             className="font-bold tracking-tight text-lg md:hidden truncate max-w-[150px]"
//           >
//             TradeLedger
//           </Link>
//         </div>

//         {/* CENTER - Main Title (Desktop Only) */}
//         {/* Absolute positioning keeps it perfectly centered regardless of side content widths */}
//         <div className="hidden md:flex flex-1 justify-center absolute left-1/2 -translate-x-1/2 pointer-events-none">
//           <Link
//             href="/"
//             className="text-xl font-extrabold tracking-tight text-foreground pointer-events-auto hover:opacity-80 transition-opacity"
//           >
//             Share
//             <span className="text-blue-500 font-black">Track</span>
//           </Link>
//         </div>
//         {/* RIGHT SIDE - Actions (Theme & Logout) */}
//         <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end">
//           <ThemeToggle />
//           {status === "loading" ? (
//             <>
//               <div className="flex items-center gap-2 pl-2">
//                 <div className="h-9 w-24 rounded-md bg-muted/60 animate-pulse border border-border/50 flex items-center justify-center">
//                   <Skeleton className="hidden sm:block h-full w-full rounded-md bg-primary/20" />
//                 </div>
//               </div>
//             </>
//           ) : (
//             <>
//               {session ? (
//                 <AlertDialog>
//                   <AlertDialogTrigger asChild>
//                     <Button
//                       variant="ghost"
//                       className="gap-2 text-muted-foreground hover:text-rose-500 text-red-500 hover:bg-rose-500/10 transition-colors px-2 sm:px-4"
//                     >
//                       <LogOut className="h-4 w-4 sm:h-4 sm:w-4" />
//                       <span className="hidden sm:inline font-semibold tracking-wide text-sm ">
//                         Logout
//                       </span>
//                     </Button>
//                   </AlertDialogTrigger>
//                   <AlertDialogContent className="sm:max-w-[420px] border border-border/80 shadow-2xl rounded-xl">
//                     <AlertDialogHeader>
//                       <AlertDialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
//                         <LogOut className="h-5 w-5 text-rose-500" />
//                         Secure Logout
//                       </AlertDialogTitle>
//                       <AlertDialogDescription className="text-sm font-medium text-muted-foreground leading-relaxed">
//                         Are you sure you want to exit? You will need to
//                         re-authenticate to access the TradeLedger system again.
//                       </AlertDialogDescription>
//                     </AlertDialogHeader>
//                     <AlertDialogFooter className="mt-4 sm:mt-6">
//                       <AlertDialogCancel className="font-medium tracking-wide transition-colors">
//                         Cancel
//                       </AlertDialogCancel>
//                       <AlertDialogAction
//                         onClick={(e) => {
//                           e.preventDefault();
//                           handleLogout();
//                         }}
//                         disabled={isLoggingOut}
//                         className="bg-rose-600 hover:bg-rose-700 text-white font-semibold tracking-wide shadow-md transition-all active:scale-[0.98] border-none"
//                       >
//                         {isLoggingOut ? "Processing..." : "Confirm Logout"}
//                       </AlertDialogAction>
//                     </AlertDialogFooter>
//                   </AlertDialogContent>
//                 </AlertDialog>
//               ) : (
//                 <Link href="/sign-in">
//                   <Button className="font-semibold tracking-wide px-5 shadow-md transition-all active:scale-[0.98] bg-blue-600 hover:bg-blue-700 text-white">
//                     Login
//                   </Button>
//                 </Link>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </nav>
//   );
// }

import React from "react";
import NavLogo from "./NavLogo";
import NavTitle from "./NavTitle";
import NavActions from "./NavActions";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-md shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between relative">
        <NavLogo />
        <NavTitle />
        <NavActions />
      </div>
    </nav>
  );
}
