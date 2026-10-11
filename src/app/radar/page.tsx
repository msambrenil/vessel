"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useRadarMatrix, useChat } from "@/context/VesselContext";
import { ProfileGridSkeleton } from "@/components/matrix/ProfileGridSkeleton";

const ProfileGrid = dynamic(
  () => import("@/components/matrix/ProfileGrid").then((m) => m.ProfileGrid),
  {
    ssr: false,
    loading: () => <ProfileGridSkeleton />,
  }
);

export default function RadarPage() {
  const { setSelectedProfile } = useRadarMatrix();
  const { setActiveChatProfileId } = useChat();

  return (
    <ProfileGrid
      onSelectProfile={setSelectedProfile}
      onOpenChat={setActiveChatProfileId}
    />
  );
}
