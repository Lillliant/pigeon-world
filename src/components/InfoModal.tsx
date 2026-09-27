import React, { useEffect } from 'react';
import {
  PigeonIcon,
  SeedsIcon,
  NoonIcon,
  FollowBirdieIcon,
  WindowCloseIcon,
  RomeFountainIcon,
  ForestIcon,
} from './CuteIcons';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  // Dismiss on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#27272A]/40 backdrop-blur-xs select-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-modal-title"
    >
      <div
        className="landscape-modal-container bg-[#BAE6FD] border-[2.5px] border-[#27272A] rounded-2xl shadow-retro-lg max-w-md landscape:max-w-2xl sm:max-w-xl md:max-w-2xl w-full p-2 sm:p-2.5 text-[#27272A] animate-in zoom-in-95 duration-150 flex flex-col max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Titlebar */}
        <div className="shrink-0 bg-[#FED7AA] border-[2px] border-[#27272A] rounded-xl px-2.5 sm:px-3 py-1 sm:py-1.5 flex items-center justify-between mb-1.5 sm:mb-2 shadow-retro-sm">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <PigeonIcon size={16} />
            <h2 id="guide-modal-title" className="font-display font-extrabold text-xs sm:text-sm tracking-wider uppercase">
              pigeon_handbook.guide
            </h2>
          </div>
          
          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center bg-white hover:bg-[#F87171] active:bg-[#EF4444] border-[1.8px] border-[#27272A] rounded-md shadow-retro-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer transition-all shrink-0"
            aria-label="Close handbook"
            title="Close handbook"
          >
            <WindowCloseIcon size={10} />
          </button>
        </div>

        {/* Content Body with Retro Grid */}
        <div className="retro-grid-bg border-[2px] border-[#27272A] rounded-xl p-2 sm:p-3 flex flex-col min-h-0 flex-1 overflow-hidden">
          
          {/* Scrollable Cards Grid Container */}
          <div className="landscape-modal-grid overflow-y-auto overscroll-contain pr-1 retro-scrollbar flex-1 min-h-0 grid grid-cols-1 landscape:grid-cols-2 sm:grid-cols-2 gap-1.5 sm:gap-2">
            
            {/* Card: Scenery Worlds */}
            <div className="flex items-start gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl bg-white border-[1.8px] border-[#27272A] shadow-retro-sm hover:shadow-retro transition-shadow">
              <div className="p-1 sm:p-1.5 rounded-lg bg-[#FED7AA] border-[1.5px] border-[#27272A] shrink-0">
                <ForestIcon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-extrabold text-[#27272A] font-display text-xs block">3 Sceneries</span>
                <p className="text-[#27272A]/80 leading-snug mt-0.5 font-medium text-[11px] sm:text-xs">
                  Switch between Forest Meadow, Sunny Beach, and Ancient Rome village.
                </p>
              </div>
            </div>

            {/* Card: Physical Interactivity */}
            <div className="flex items-start gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl bg-white border-[1.8px] border-[#27272A] shadow-retro-sm hover:shadow-retro transition-shadow">
              <div className="p-1 sm:p-1.5 rounded-lg bg-[#A7F3D0] border-[1.5px] border-[#27272A] shrink-0">
                <RomeFountainIcon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-extrabold text-[#27272A] font-display text-xs block">Obstacles & Perching</span>
                <p className="text-[#27272A]/80 leading-snug mt-0.5 font-medium text-[11px] sm:text-xs">
                  Pigeons steer around obstacles, or perch on fountain rims and benches.
                </p>
              </div>
            </div>

            {/* Card: Feeding & Interaction */}
            <div className="flex items-start gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl bg-white border-[1.8px] border-[#27272A] shadow-retro-sm hover:shadow-retro transition-shadow">
              <div className="p-1 sm:p-1.5 rounded-lg bg-[#FEF08A] border-[1.5px] border-[#27272A] shrink-0">
                <SeedsIcon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-extrabold text-[#27272A] font-display text-xs block">Feeding</span>
                <p className="text-[#27272A]/80 leading-snug mt-0.5 font-medium text-[11px] sm:text-xs">
                  Double-click the ground or tap <strong>Feed</strong> to scatter seeds for the flock.
                </p>
              </div>
            </div>

            {/* Card: Drag Perspectives & Click to Scare */}
            <div className="flex items-start gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl bg-white border-[1.8px] border-[#27272A] shadow-retro-sm hover:shadow-retro transition-shadow">
              <div className="p-1 sm:p-1.5 rounded-lg bg-[#FBCFE8] border-[1.5px] border-[#27272A] shrink-0">
                <PigeonIcon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-extrabold text-[#27272A] font-display text-xs block">Look & Scatter</span>
                <p className="text-[#27272A]/80 leading-snug mt-0.5 font-medium text-[11px] sm:text-xs">
                  Drag to orbit the view. Click the ground or tap <strong>Scatter</strong> to startle birds.
                </p>
              </div>
            </div>

            {/* Card: Sky & Time */}
            <div className="flex items-start gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl bg-white border-[1.8px] border-[#27272A] shadow-retro-sm hover:shadow-retro transition-shadow">
              <div className="p-1 sm:p-1.5 rounded-lg bg-[#FED7AA] border-[1.5px] border-[#27272A] shrink-0">
                <NoonIcon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-extrabold text-[#27272A] font-display text-xs block">Time of Day</span>
                <p className="text-[#27272A]/80 leading-snug mt-0.5 font-medium text-[11px] sm:text-xs">
                  Cycle presets or drag the slider from Dawn and Noon to Twilight.
                </p>
              </div>
            </div>

            {/* Card: Birdie Cam */}
            <div className="flex items-start gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl bg-white border-[1.8px] border-[#27272A] shadow-retro-sm hover:shadow-retro transition-shadow">
              <div className="p-1 sm:p-1.5 rounded-lg bg-[#BAE6FD] border-[1.5px] border-[#27272A] shrink-0">
                <FollowBirdieIcon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-extrabold text-[#27272A] font-display text-xs block">Birdie Cam</span>
                <p className="text-[#27272A]/80 leading-snug mt-0.5 font-medium text-[11px] sm:text-xs">
                  Tap <strong>Follow</strong> to glide alongside a pigeon in 360° view.
                </p>
              </div>
            </div>

          </div>

          {/* Close Action Button - Pinned at bottom */}
          <button
            onClick={onClose}
            className="w-full mt-2 shrink-0 py-1.5 sm:py-2 px-3 text-xs font-extrabold text-[#27272A] bg-[#FEF08A] hover:bg-[#FACC15] border-[2px] border-[#27272A] rounded-xl transition-all cursor-pointer shadow-retro-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-2 font-display"
          >
            <PigeonIcon size={15} />
            <span>Return to Scene</span>
          </button>

        </div>

      </div>
    </div>
  );
};

