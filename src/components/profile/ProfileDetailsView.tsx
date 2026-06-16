"use client";

import React from "react";
import {
  User,
  Mail,
  Briefcase,
  Phone,
  Calendar,
  MapPin,
  ShieldCheck,
  Pencil,
  Fingerprint,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProfileDetailsViewProps {
  profile: any;
  isEditing: boolean;
  onToggleEdit: () => void;
}

const InfoField = ({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: any;
  label: string;
  value: string;
  className?: string; // Added to handle conditional grid spacing
}) => (
  <div
    className={cn(
      "group flex items-start gap-3 p-2.5 rounded-lg border border-slate-100 dark:border-transparent bg-white dark:bg-transparent hover:border-blue-500/20 hover:bg-blue-500/5 transition-all duration-200 min-w-0",
      className,
    )}
  >
    <div className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-500 dark:text-slate-400 shadow-sm group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:border-blue-500/20 shrink-0">
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0 -mt-0.5 w-full">
      <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
        {label}
      </span>
      {/* Changed truncate to break-all & break-words to handle huge/unbroken strings gracefully */}
      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 break-all sm:break-words whitespace-pre-wrap leading-relaxed">
        {value}
      </p>
    </div>
  </div>
);

export default function ProfileDetailsView({
  profile,
  isEditing,
  onToggleEdit,
}: ProfileDetailsViewProps) {
  const formattedDOB = profile.dateOfBirth
    ? new Date(profile.dateOfBirth).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not Provided";

  return (
    <div className="flex flex-col">
      <div className="p-6 border-b border-slate-100 dark:border-slate-900 bg-gradient-to-b from-blue-500/5 to-transparent dark:from-blue-950/10">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-500/20 shadow-sm shrink-0">
            <User className="h-7 w-7" />
          </div>
          <div className="space-y-1 pr-6 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate">
                {profile.username}
              </h3>
              {profile.isVerified && (
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-[9px] uppercase font-bold tracking-wider border border-emerald-500/20 h-5 shrink-0">
                  <ShieldCheck className="h-3 w-3 mr-1" /> Verified
                </Badge>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 truncate">
                <Mail className="h-3 w-3 text-slate-400 dark:text-slate-500 shrink-0" />{" "}
                {profile.email}
              </span>
              <span className="font-mono bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-[10px] w-fit shrink-0">
                ID: {profile._id?.slice(-6)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-slate-50/50 dark:bg-slate-950">
        <div className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2 mb-3">
          <Fingerprint className="h-3.5 w-3.5 text-blue-500" /> Core Node
          Parameters
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoField
            icon={Briefcase}
            label="Profession"
            value={profile.profession || "Developer"}
          />
          <InfoField
            icon={Phone}
            label="Secure Line"
            value={profile.phoneNumber || "Empty Trace"}
          />
          <InfoField
            icon={Calendar}
            label="Date of Incarnation"
            value={formattedDOB}
          />
          {/* Spanned the address field layout parameters for optimal multi-line reading profiles */}
          <InfoField
            icon={MapPin}
            label="Nexus Address"
            value={profile.address || "Empty Localization"}
            className="sm:col-span-2"
          />
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleEdit}
            className={cn(
              "h-9 w-full sm:w-auto gap-1.5 text-xs font-bold transition-all border-slate-200 dark:border-slate-800 shadow-sm",
              isEditing
                ? "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                : "bg-blue-600/5 text-blue-600 dark:text-blue-400 hover:bg-blue-600/10 border-blue-500/20",
            )}
          >
            <Pencil className="h-3.5 w-3.5" />
            {isEditing
              ? "Close Editing Terminal"
              : "Modify Registry Attributes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
