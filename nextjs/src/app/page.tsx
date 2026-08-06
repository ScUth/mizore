"use client";

import { useRouter, redirect } from "next/navigation";


export default function LandingPage() {

  return (
    redirect("/admin")
  );
}
