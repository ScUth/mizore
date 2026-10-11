"use client";
import AdminGuard from "./components/adminGuard";
import PathContent from "./components/pathContent";

export default function LandingPage() {

  return (
    <AdminGuard>
      <PathContent />
    </AdminGuard>
  );
}