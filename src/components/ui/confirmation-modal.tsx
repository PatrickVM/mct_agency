"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  icon?: "warning" | "delete" | "info";
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

export function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  icon = "warning",
  onConfirm,
  loading = false,
}: ConfirmationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const IconComponent = {
    warning: AlertTriangle,
    delete: Trash2,
    info: AlertTriangle,
  }[icon];

  const iconColor = {
    warning: "text-amber-500",
    delete: "text-destructive",
    info: "text-blue-500",
  }[icon];

  const isLoading = loading || isProcessing;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-full bg-muted ${iconColor}`}>
              <IconComponent className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-semibold">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
            ) : (
              <IconComponent className="h-4 w-4 mr-2" />
            )}
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook for easier usage
export function useConfirmationModal() {
  const [modalState, setModalState] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive";
    icon?: "warning" | "delete" | "info";
    onConfirm: () => void | Promise<void>;
  } | null>(null);

  const confirm = (options: Omit<NonNullable<typeof modalState>, "open">) => {
    return new Promise<boolean>((resolve) => {
      setModalState({
        ...options,
        open: true,
        onConfirm: async () => {
          await options.onConfirm();
          resolve(true);
        },
      });
    });
  };

  const closeModal = () => {
    setModalState(null);
  };

  const ConfirmationModalComponent = modalState ? (
    <ConfirmationModal
      {...modalState}
      onOpenChange={(open) => {
        if (!open) closeModal();
      }}
    />
  ) : null;

  return {
    confirm,
    ConfirmationModalComponent,
  };
}