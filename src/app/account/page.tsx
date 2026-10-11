"use client";

import React from "react";
import dynamic from "next/dynamic";
const ProtocolView = dynamic(
  () => import("@/components/account/ProtocolView").then((m) => m.ProtocolView),
  { ssr: false }
);

export default function AccountPage() {
  return <ProtocolView />;
}
