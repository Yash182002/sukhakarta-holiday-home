"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";

const Footer = dynamic(() => import("@/components/Footer"), {
  ssr: false,
});

export default function PublicShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
