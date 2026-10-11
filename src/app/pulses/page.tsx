"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useChat } from "@/context/VesselContext";
import { PulsesListSkeleton } from "@/components/pulses/PulsesListSkeleton";

const PulsesView = dynamic(
  () => import("@/components/pulses/PulsesView").then((m) => m.PulsesView),
  {
    ssr: false,
    loading: () => <PulsesListSkeleton />,
  }
);

export default function PulsesPage() {
  const { setActiveChatProfileId } = useChat();

  const handleOpenChat = React.useCallback(
    (profileId: string) => setActiveChatProfileId(profileId),
    [setActiveChatProfileId]
  );

  return <PulsesView onOpenChat={handleOpenChat} />;
}
