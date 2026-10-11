"use client";

import React from "react";
import { BrutalistModal } from "@/components/ui/BrutalistModal";
import { UserAlbumManager } from "../UserAlbumManager";
import { FolderLock } from "lucide-react";

export interface PhotosSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhotosSheet: React.FC<PhotosSheetProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <BrutalistModal
      isOpen={isOpen}
      onClose={onClose}
      title="Fotos & Álbumes con Llave"
      subtitle="Fotos públicas para el radar y álbumes privados con llave"
      icon={<FolderLock className="w-5 h-5 text-electricViolet-glow" />}
      maxWidth="3xl"
      className="p-1 sm:p-2"
    >
      <div data-testid="albums-tab" className="overflow-y-auto max-h-[75vh] sm:max-h-[80vh] p-2 sm:p-4 space-y-4">
        <UserAlbumManager />
      </div>
    </BrutalistModal>
  );
};
