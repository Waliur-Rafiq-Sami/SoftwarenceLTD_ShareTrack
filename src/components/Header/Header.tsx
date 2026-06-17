import React from "react";
import NavLogo from "./NavLogo";
import NavTitle from "./NavTitle";
import NavActions from "./NavActions";

export default function Header() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-md shadow-sm transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between relative">
        <NavLogo />
        <NavTitle />
        <NavActions />
      </div>
    </nav>
  );
}
