import React from 'react';
import { MuhasabahModal, DistractionSource, KaffarahMode } from './MuhasabahModal';

export type { DistractionSource, KaffarahMode };

export interface WastedTimeRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToQuests?: () => void;
}

/**
 * Backward-compatible proxy component pointing to the unified Muhasabah Command Center
 */
export const WastedTimeRecoveryModal: React.FC<WastedTimeRecoveryModalProps> = ({
  isOpen,
  onClose,
  onNavigateToQuests
}) => {
  return (
    <MuhasabahModal
      isOpen={isOpen}
      onClose={onClose}
      initialTab="wasted_time"
      onNavigateToQuests={onNavigateToQuests}
    />
  );
};
