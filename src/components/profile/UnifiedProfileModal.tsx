// "use client";

// import React, { useState, useRef } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { User, KeyRound, X } from "lucide-react";
// import { Dialog, DialogContent } from "@/components/ui/dialog";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Skeleton } from "@/components/ui/skeleton";
// import * as DialogPrimitive from "@radix-ui/react-dialog";

// // Sub-Component Imports
// import ProfileDetailsView from "./ProfileDetailsView";
// import ProfileEditForm from "./ProfileEditForm";
// import PasswordEditForm from "./PasswordEditForm";

// interface UnifiedProfileModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export default function UnifiedProfileModal({
//   isOpen,
//   onClose,
// }: UnifiedProfileModalProps) {
//   const formEndRef = useRef<HTMLDivElement>(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [activeTab, setActiveTab] = useState<string>("identity");

//   // Fetch Core Profile Data
//   const {
//     data: response,
//     isLoading,
//     error,
//   } = useQuery<{ success: boolean; data: any }>({
//     queryKey: ["user-profile-context"],
//     queryFn: async () => {
//       const res = await fetch("/api/profile");
//       if (!res.ok) throw new Error("Failed to fetch profile");
//       return res.json();
//     },
//     staleTime: 1000 * 60 * 15,
//     enabled: isOpen,
//   });

//   const profile = response?.data;

//   const handleToggleEdit = () => {
//     setIsEditing((prev) => !prev);
//     if (!isEditing) {
//       setTimeout(() => {
//         formEndRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "start",
//         });
//       }, 100);
//     }
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
//       <DialogContent
//         showCloseButton={false}
//         // className="sm:max-w-[540px] max-h-[85vh] overflow-y-auto border border-slate-800 bg-slate-950 text-slate-50 shadow-2xl rounded-xl p-0 z-[100] scrollbar-thin scrollbar-thumb-slate-800"
//         className="sm:max-w-[540px] max-h-[85vh] overflow-y-auto border border-slate-800 bg-slate-950 text-slate-50 shadow-2xl rounded-xl p-0 z-[100]
//   [&::-webkit-scrollbar]:w-1.5
//   [&::-webkit-scrollbar-track]:bg-slate-950
//   [&::-webkit-scrollbar-thumb]:bg-slate-800
//   [&::-webkit-scrollbar-thumb]:rounded-full
//   hover:[&::-webkit-scrollbar-thumb]:bg-slate-700
//   [scrollbar-width:thin]
//   [scrollbar-color:#1e293b_#020617]
//   bg-background
//   "
//       >
//         <DialogPrimitive.Close className="absolute right-3 top-3 z-50 rounded-full p-2 bg-slate-900/50 border border-slate-800/80 hover:bg-slate-800 transition-colors group">
//           <X className="h-4 w-4 text-slate-400 group-hover:text-slate-100" />
//         </DialogPrimitive.Close>

//         {isLoading ? (
//           <div className="p-8 space-y-4">
//             <Skeleton className="h-12 w-12 rounded-full bg-slate-900" />
//             <Skeleton className="h-6 w-1/2 bg-slate-900" />
//             <Skeleton className="h-24 w-full bg-slate-900" />
//           </div>
//         ) : error || !response?.success ? (
//           <div className="p-6 text-sm text-destructive bg-destructive/10 m-4 rounded-lg">
//             System Error: Core workspace context unavailable.
//           </div>
//         ) : (
//           <div className="flex flex-col">
//             {/* View Layer Segment */}
//             <ProfileDetailsView
//               profile={profile}
//               isEditing={isEditing}
//               onToggleEdit={handleToggleEdit}
//             />

//             {/* Collapsible Forms Section Layer */}
//             {isEditing && (
//               <div
//                 ref={formEndRef}
//                 className="border-t border-slate-900 bg-slate-950/60 p-6 animate-in slide-in-from-bottom-2 duration-300"
//               >
//                 <Tabs
//                   value={activeTab}
//                   onValueChange={setActiveTab}
//                   className="w-full"
//                 >
//                   <TabsList className="bg-slate-900 border border-slate-800 text-slate-400 p-1 rounded-lg w-full grid grid-cols-2 mb-5">
//                     <TabsTrigger
//                       value="identity"
//                       className="data-[state=active]:bg-slate-950 data-[state=active]:text-slate-50 font-semibold text-xs tracking-wide uppercase transition-all"
//                     >
//                       <User className="h-3.5 w-3.5 mr-2" /> Identity Specs
//                     </TabsTrigger>
//                     <TabsTrigger
//                       value="security"
//                       className="data-[state=active]:bg-slate-950 data-[state=active]:text-slate-50 font-semibold text-xs tracking-wide uppercase transition-all"
//                     >
//                       <KeyRound className="h-3.5 w-3.5 mr-2" /> Security Keys
//                     </TabsTrigger>
//                   </TabsList>

//                   <TabsContent
//                     value="identity"
//                     className="focus-visible:outline-none"
//                   >
//                     <ProfileEditForm
//                       profile={profile}
//                       onCompleted={() => setIsEditing(false)}
//                     />
//                   </TabsContent>

//                   <TabsContent
//                     value="security"
//                     className="focus-visible:outline-none"
//                   >
//                     <PasswordEditForm onCompleted={() => setIsEditing(false)} />
//                   </TabsContent>
//                 </Tabs>
//               </div>
//             )}
//           </div>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }

// "use client";

// import React, { useState, useRef } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { User, KeyRound, X } from "lucide-react";
// import { Dialog, DialogContent } from "@/components/ui/dialog";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Skeleton } from "@/components/ui/skeleton";
// import * as DialogPrimitive from "@radix-ui/react-dialog";

// import ProfileDetailsView from "./ProfileDetailsView";
// import ProfileEditForm from "./ProfileEditForm";
// import PasswordEditForm from "./PasswordEditForm";

// interface UnifiedProfileModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export default function UnifiedProfileModal({
//   isOpen,
//   onClose,
// }: UnifiedProfileModalProps) {
//   const formEndRef = useRef<HTMLDivElement>(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [activeTab, setActiveTab] = useState<string>("identity");

//   const {
//     data: response,
//     isLoading,
//     error,
//   } = useQuery({
//     queryKey: ["user-profile-context"],
//     queryFn: async () => {
//       const res = await fetch("/api/profile");
//       if (!res.ok) throw new Error("Failed to fetch profile");
//       return res.json();
//     },
//     enabled: isOpen,
//   });

//   const profile = response?.data;

//   const handleToggleEdit = () => {
//     setIsEditing((prev) => !prev);
//     if (!isEditing) {
//       setTimeout(() => {
//         formEndRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "start",
//         });
//       }, 100);
//     }
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
//       <DialogContent
//         showCloseButton={false}
//         className="w-[92vw] sm:max-w-[540px] max-h-[85vh] overflow-y-auto border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 shadow-2xl rounded-xl p-0 z-[100]
//         [&::-webkit-scrollbar]:w-1.5
//         [&::-webkit-scrollbar-track]:bg-slate-50 dark:[&::-webkit-scrollbar-track]:bg-slate-950
//         [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-800
//         [&::-webkit-scrollbar-thumb]:rounded-full
//         hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-700"
//       >
//         {/* Awesome Touch-Friendly Close Button */}
//         <DialogPrimitive.Close className="absolute right-3 top-3 z-50 h-9 w-9 flex items-center justify-center rounded-full bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-sm shadow-sm active:scale-95 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all">
//           <X className="h-4 w-4" />
//         </DialogPrimitive.Close>

//         {isLoading ? (
//           <div className="p-8 space-y-4">
//             <Skeleton className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-900" />
//             <Skeleton className="h-6 w-1/2 bg-slate-200 dark:bg-slate-900" />
//             <Skeleton className="h-24 w-full bg-slate-200 dark:bg-slate-900" />
//           </div>
//         ) : error || !response?.success ? (
//           <div className="p-6 text-sm text-destructive bg-destructive/10 m-4 rounded-lg">
//             System Error: Core workspace context unavailable.
//           </div>
//         ) : (
//           <div className="flex flex-col">
//             <ProfileDetailsView
//               profile={profile}
//               isEditing={isEditing}
//               onToggleEdit={handleToggleEdit}
//             />

//             {isEditing && (
//               <div
//                 ref={formEndRef}
//                 className="border-t border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/60 p-4 sm:p-6"
//               >
//                 <Tabs
//                   value={activeTab}
//                   onValueChange={setActiveTab}
//                   className="w-full"
//                 >
//                   <TabsList className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 p-1 rounded-lg w-full grid grid-cols-2 mb-5">
//                     <TabsTrigger
//                       value="identity"
//                       className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-50 font-semibold text-xs tracking-wide uppercase transition-all shadow-sm"
//                     >
//                       <User className="h-3.5 w-3.5 mr-2" /> Identity Specs
//                     </TabsTrigger>
//                     <TabsTrigger
//                       value="security"
//                       className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-50 font-semibold text-xs tracking-wide uppercase transition-all shadow-sm"
//                     >
//                       <KeyRound className="h-3.5 w-3.5 mr-2" /> Security Keys
//                     </TabsTrigger>
//                   </TabsList>

//                   <TabsContent
//                     value="identity"
//                     className="focus-visible:outline-none"
//                   >
//                     <ProfileEditForm
//                       profile={profile}
//                       onCompleted={() => setIsEditing(false)}
//                     />
//                   </TabsContent>

//                   <TabsContent
//                     value="security"
//                     className="focus-visible:outline-none"
//                   >
//                     <PasswordEditForm onCompleted={() => setIsEditing(false)} />
//                   </TabsContent>
//                 </Tabs>
//               </div>
//             )}
//           </div>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }

"use client";

import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, KeyRound, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import ProfileDetailsView from "./ProfileDetailsView";
import ProfileEditForm from "./ProfileEditForm";
import PasswordEditForm from "./PasswordEditForm";

interface UnifiedProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UnifiedProfileModal({
  isOpen,
  onClose,
}: UnifiedProfileModalProps) {
  const formEndRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("identity");

  // Track username validation state from nested edit form block container
  const [isProfileSaveable, setIsProfileSaveable] = useState(true);

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user-profile-context"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    enabled: isOpen,
  });

  const profile = response?.data;

  const handleToggleEdit = () => {
    // Block closing edit terminal if username status check is currently invalid
    if (isEditing && !isProfileSaveable) return;

    setIsEditing((prev) => !prev);
    if (!isEditing) {
      setTimeout(() => {
        formEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  const handleCloseAttempt = () => {
    if (isEditing && !isProfileSaveable) return; // Prevent action execution
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && handleCloseAttempt()}
    >
      <DialogContent
        showCloseButton={false}
        onPointerDownOutside={(e) =>
          isEditing && !isProfileSaveable && e.preventDefault()
        }
        onEscapeKeyDown={(e) =>
          isEditing && !isProfileSaveable && e.preventDefault()
        }
        className="w-[92vw] sm:max-w-[540px] max-h-[85vh] overflow-y-auto border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 shadow-2xl rounded-xl p-0 z-[100] 
        [&::-webkit-scrollbar]:w-1.5 
        [&::-webkit-scrollbar-track]:bg-slate-50 dark:[&::-webkit-scrollbar-track]:bg-slate-950 
        [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-800 
        [&::-webkit-scrollbar-thumb]:rounded-full 
        hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-700"
      >
        {/* Awesome Close button -> Disabled dynamically when username error surfaces */}
        <DialogPrimitive.Close
          disabled={isEditing && !isProfileSaveable}
          className="absolute right-3 top-3 z-50 h-9 w-9 flex items-center justify-center rounded-full bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-sm shadow-sm active:scale-95 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>

        {isLoading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-900" />
            <Skeleton className="h-6 w-1/2 bg-slate-200 dark:bg-slate-900" />
            <Skeleton className="h-24 w-full bg-slate-200 dark:bg-slate-900" />
          </div>
        ) : error || !response?.success ? (
          <div className="p-6 text-sm text-destructive bg-destructive/10 m-4 rounded-lg">
            System Error: Core workspace context unavailable.
          </div>
        ) : (
          <div className="flex flex-col">
            <ProfileDetailsView
              profile={profile}
              isEditing={isEditing}
              onToggleEdit={handleToggleEdit}
            />

            {isEditing && (
              <div
                ref={formEndRef}
                className="border-t border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/60 p-4 sm:p-6"
              >
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 p-1 rounded-lg w-full grid grid-cols-2 mb-5">
                    <TabsTrigger
                      value="identity"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-50 font-semibold text-xs tracking-wide uppercase transition-all shadow-sm"
                    >
                      <User className="h-3.5 w-3.5 mr-2" /> Identity Specs
                    </TabsTrigger>
                    <TabsTrigger
                      value="security"
                      disabled={!isProfileSaveable}
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-50 font-semibold text-xs tracking-wide uppercase transition-all shadow-sm disabled:opacity-40"
                    >
                      <KeyRound className="h-3.5 w-3.5 mr-2" /> Security Keys
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="identity"
                    className="focus-visible:outline-none"
                  >
                    <ProfileEditForm
                      profile={profile}
                      onCompleted={() => setIsEditing(false)}
                      onValidationChange={setIsProfileSaveable} // Passes validation hook logic to controller tracking states
                    />
                  </TabsContent>

                  <TabsContent
                    value="security"
                    className="focus-visible:outline-none"
                  >
                    <PasswordEditForm onCompleted={() => setIsEditing(false)} />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
