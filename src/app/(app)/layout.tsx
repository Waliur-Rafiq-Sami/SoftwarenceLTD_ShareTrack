import Header from "@/components/Header/Header";
import { Navbar } from "@/components/nav/Navbar";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* <Header /> */}
      <Navbar></Navbar>
      {children}
    </div>
  );
}
