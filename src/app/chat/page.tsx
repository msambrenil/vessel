"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useChat } from "@/context/VesselContext";
import { PulsesListSkeleton } from "@/components/pulses/PulsesListSkeleton";

const DarkroomListView = dynamic(
  () => import("@/components/chat/DarkroomListView").then((m) => m.DarkroomListView),
  {
    ssr: false,
    loading: () => <PulsesListSkeleton />,
  }
);

export default function ChatPage() {
  const { setActiveChatProfileId } = useChat();

  const handleOpenChat = React.useCallback(
    (profileId: string) => setActiveChatProfileId(profileId),
    [setActiveChatProfileId]
  );

  return <DarkroomListView onOpenChat={handleOpenChat} />;
}
