"use client";

import React from "react";
import { UserAlbumManager } from "../UserAlbumManager";

export const AlbumsTab: React.FC = () => {
  return (
    <div className="space-y-4 animate-fade-in">
      <UserAlbumManager />
    </div>
  );
};
