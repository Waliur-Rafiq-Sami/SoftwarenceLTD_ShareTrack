import Link from "next/link";
import { Landmark } from "lucide-react";

export default function NavLogo() {
  return (
    <div className="flex items-center gap-3 flex-1 md:flex-none">
      <div className="bg-blue-500/10 p-2 rounded-xl border border-blue-500/20 shadow-inner">
        <Landmark className="h-5 w-5 text-blue-500" />
      </div>
      {/* Mobile Title - Hidden on medium screens and up */}
      <Link
        href="/"
        className="font-bold tracking-tight text-lg md:hidden truncate max-w-[150px]"
      >
        ShareTrack
      </Link>
    </div>
  );
}
