import Link from "next/link";

export default function NavTitle() {
  return (
    <div className="hidden md:flex flex-1 justify-center absolute left-1/2 -translate-x-1/2 pointer-events-none">
      <Link
        href="/"
        className="text-xl font-extrabold tracking-tight text-foreground pointer-events-auto hover:opacity-80 transition-opacity"
      >
        Share<span className="text-blue-500 font-black">Track</span>
      </Link>
    </div>
  );
}
