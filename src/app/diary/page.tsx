"use client";

import React from "react";
import dynamic from "next/dynamic";
const DateDiaryView = dynamic(
  () => import("@/components/diary/DateDiaryView").then((m) => m.DateDiaryView),
  { ssr: false }
);

export default function DiaryPage() {
  return <DateDiaryView />;
}
