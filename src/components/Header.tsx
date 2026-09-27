import React, { useState, useEffect } from 'react';
import { TimeOfDay, SceneryType } from '../types';
import {
  PigeonIcon,
  SeedsIcon,
  ScatterIcon,
  FollowBirdieIcon,
  ResetViewIcon,
  VolumeIcon,
  VolumeMutedIcon,
  GuideBookIcon,
  ForestIcon,
  BeachIcon,
  AncientRomeIcon,
  MinusIcon,
  PlusIcon,
  DawnIcon,
  NoonIcon,
  SunsetIcon,
  TwilightIcon,
} from './CuteIcons';

interface HeaderProps {
  pigeonCount: number;
  onPigeonCountChange: (count: number) => void;
  timeProgress: number;
  onTimeProgressChange: (progress: number) => void;
  onPresetTimeChange: (time: TimeOfDay) => void;
  isFollowingPigeon: boolean;
  onToggleFollow: () => void;
  onDropSeeds: () => void;
  onScatterAll: () => void;
  onResetCamera: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenInfo: () => void;
  currentScenery: SceneryType;
  onSelectScenery: (scenery: SceneryType) => void;
}

export const Header: React.FC<HeaderProps> = ({
  pigeonCount,
  onPigeonCountChange,
  timeProgress,
  onTimeProgressChange,
  onPresetTimeChange,
  isFollowingPigeon,
  onToggleFollow,
  onDropSeeds,
  onScatterAll,
  onResetCamera,
  isMuted,
  onToggleMute,
  onOpenInfo,
  currentScenery,
  onSelectScenery,
}) => {
  // Local state for direct typing in pigeon amount input
  const [typedCount, setTypedCount] = useState<string>(pigeonCount.toString());

  // Window width tracking for bulletproof adaptive layouts
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keep typed input in sync with external updates
  useEffect(() => {
    setTypedCount(pigeonCount.toString());
  }, [pigeonCount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTypedCount(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 150) {
      onPigeonCountChange(parsed);
    }
  };

  const handleInputBlur = () => {
    let parsed = parseInt(typedCount, 10);
    if (isNaN(parsed) || parsed < 1) parsed = 1;
    else if (parsed > 150) parsed = 150;
    setTypedCount(parsed.toString());
    onPigeonCountChange(parsed);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleDecrement = () => {
    const next = Math.max(1, pigeonCount - 1);
    onPigeonCountChange(next);
  };

  const handleIncrement = () => {
    const next = Math.min(150, pigeonCount + 1);
    onPigeonCountChange(next);
  };

  // Helper to determine time phase for tooltip / indicator
  const getTimePhase = (p: number): { label: string; icon: React.ReactNode } => {
    if (p < 20) return { label: 'Dawn', icon: <DawnIcon size={15} /> };
    if (p < 55) return { label: 'Noon', icon: <NoonIcon size={15} /> };
    if (p < 80) return { label: 'Sunset', icon: <SunsetIcon size={15} /> };
    return { label: 'Twilight', icon: <TwilightIcon size={15} /> };
  };

  const currentPhase = getTimePhase(timeProgress);

  // Layout mode based on viewport width:
  // - Mobile (< 640px): 3 balanced compact rows (~210px each) so nothing ever overflows
  // - Tablet (640px to 979px): 2 centered rows (~340px each)
  // - Laptop (>= 980px): 1 sleek single line (~680px)
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 980;

  // --- UNIT A: System Controls & Scenery ---
  const renderUnitA = () => (
    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
      {/* 1. RESET (Icon only) */}
      <button
        onClick={onResetCamera}
        aria-label="Reset camera view"
        title="Reset camera view"
        className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg bg-white hover:bg-[#BEF264] active:bg-[#A3E635] text-[#27272A] border-[1.5px] border-[#27272A] flex items-center justify-center shadow-retro-sm active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none cursor-pointer transition-all shrink-0"
      >
        <ResetViewIcon size={16} />
      </button>

      {/* 2. VOLUME (Icon only) */}
      <button
        onClick={onToggleMute}
        aria-label={isMuted ? 'Unmute audio volume' : 'Mute audio volume'}
        title={isMuted ? 'Unmute audio volume' : 'Mute audio volume'}
        className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg bg-white hover:bg-[#FED7AA] active:bg-[#FB923C] text-[#27272A] border-[1.5px] border-[#27272A] flex items-center justify-center shadow-retro-sm active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none cursor-pointer transition-all shrink-0"
      >
        {isMuted ? <VolumeMutedIcon size={16} /> : <VolumeIcon size={16} />}
      </button>

      {/* 3. GUIDE (Icon only) */}
      <button
        onClick={onOpenInfo}
        aria-label="Open pigeon handbook guide"
        title="Handbook & Guide"
        className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg bg-white hover:bg-[#FEF08A] active:bg-[#FACC15] text-[#27272A] border-[1.5px] border-[#27272A] flex items-center justify-center shadow-retro-sm active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none cursor-pointer transition-all shrink-0"
      >
        <GuideBookIcon size={16} />
      </button>

      {/* Divider */}
      <div className="w-[1.2px] h-5 bg-[#27272A]/20 shrink-0 mx-0.5" aria-hidden="true" />

      {/* 4. Scene text (NO brackets) */}
      <span className="text-xs sm:text-xs font-black tracking-tight text-[#27272A] uppercase shrink-0 select-none px-0.5 leading-none">
        Scene
      </span>

      {/* Forest (Icon only) */}
      <button
        onClick={() => onSelectScenery('forest')}
        aria-label="Forest Scenery"
        title="Forest Meadow"
        className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg border-[1.5px] border-[#27272A] flex items-center justify-center cursor-pointer transition-all shrink-0 ${
          currentScenery === 'forest'
            ? 'bg-[#BEF264] shadow-retro-sm ring-1 ring-[#27272A]/40'
            : 'bg-white hover:bg-[#F7FEE7] shadow-retro-sm active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none'
        }`}
      >
        <ForestIcon size={18} />
      </button>

      {/* Beach (Icon only) */}
      <button
        onClick={() => onSelectScenery('beach')}
        aria-label="Beach Scenery"
        title="Tropical Beach"
        className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg border-[1.5px] border-[#27272A] flex items-center justify-center cursor-pointer transition-all shrink-0 ${
          currentScenery === 'beach'
            ? 'bg-[#FEF08A] shadow-retro-sm ring-1 ring-[#27272A]/40'
            : 'bg-white hover:bg-[#FEFCE8] shadow-retro-sm active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none'
        }`}
      >
        <BeachIcon size={18} />
      </button>

      {/* Ancient Rome (Icon only) */}
      <button
        onClick={() => onSelectScenery('fountain')}
        aria-label="Ancient Rome Scenery with Fountain"
        title="Ancient Rome with Fountain"
        className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg border-[1.5px] border-[#27272A] flex items-center justify-center cursor-pointer transition-all shrink-0 ${
          currentScenery === 'fountain'
            ? 'bg-[#FED7AA] shadow-retro-sm ring-1 ring-[#27272A]/40'
            : 'bg-white hover:bg-[#FFF7ED] shadow-retro-sm active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none'
        }`}
      >
        <AncientRomeIcon size={18} />
      </button>
    </div>
  );

  // --- UNIT B: Time Controls ---
  const renderUnitB = () => (
    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
      {/* 5. Time text (NO brackets) */}
      <span className="text-xs sm:text-xs font-black tracking-tight text-[#27272A] uppercase shrink-0 select-none px-0.5 leading-none">
        Time
      </span>

      {/* Time Slider */}
      <div className="flex items-center gap-1 shrink-0" title={`Time: ${currentPhase.label} (click to cycle)`}>
        <button
          type="button"
          onClick={() => {
            let next: TimeOfDay = 'noon';
            if (timeProgress < 20) next = 'noon';
            else if (timeProgress < 55) next = 'sunset';
            else if (timeProgress < 80) next = 'twilight';
            else next = 'morning';
            onPresetTimeChange(next);
          }}
          aria-label={`Cycle time of day preset (current: ${currentPhase.label})`}
          title={`Current: ${currentPhase.label} - click to cycle time preset`}
          className="shrink-0 text-[#27272A] drop-shadow-sm cursor-pointer hover:scale-110 active:scale-95 transition-transform bg-transparent border-0 p-0 flex items-center justify-center"
        >
          {currentPhase.icon}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={timeProgress}
          onChange={(e) => onTimeProgressChange(Number(e.target.value))}
          aria-label="Time of day slider"
          title={`Drag time slider (${currentPhase.label})`}
          className="retro-time-slider w-12 sm:w-14 cursor-grab active:cursor-grabbing shrink-0"
        />
      </div>
    </div>
  );

  // --- UNIT C: Pigeon Flock Stepper ---
  const renderUnitC = () => (
    <div className="h-7.5 sm:h-8 flex items-center gap-1 shrink-0 bg-white/95 border-[1.5px] border-[#27272A] rounded-lg px-1.5 py-0.5 shadow-retro-sm">
      <span className="flex items-center text-[#27272A] shrink-0 select-none" title="Pigeon flock count">
        <PigeonIcon size={17} />
      </span>

      {/* Minus button */}
      <button
        onClick={handleDecrement}
        aria-label="Decrease pigeon count"
        title="Decrease flock (-1)"
        className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded bg-[#FEF08A] hover:bg-[#FACC15] active:bg-[#EAB308] text-[#27272A] border border-[#27272A] flex items-center justify-center cursor-pointer shadow-retro-sm active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none shrink-0"
      >
        <MinusIcon size={10} />
      </button>

      {/* Number typing input */}
      <input
        type="number"
        min={1}
        max={150}
        value={typedCount}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleInputKeyDown}
        aria-label="Type pigeon amount"
        title="Type flock amount directly"
        className="w-8 sm:w-8.5 h-5 sm:h-5.5 rounded bg-[#F8FAFC] border border-[#27272A] text-[#27272A] font-black text-xs text-center tabular-nums p-0 focus:outline-none focus:ring-1 focus:ring-[#27272A]"
      />

      {/* Plus button */}
      <button
        onClick={handleIncrement}
        aria-label="Increase pigeon count"
        title="Increase flock (+1)"
        className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded bg-[#FEF08A] hover:bg-[#FACC15] active:bg-[#EAB308] text-[#27272A] border border-[#27272A] flex items-center justify-center cursor-pointer shadow-retro-sm active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none shrink-0"
      >
        <PlusIcon size={10} />
      </button>
    </div>
  );

  // --- UNIT D: Gameplay Actions (Feed, Follow, Scatter) ---
  const renderUnitD = () => (
    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
      {/* 7. FEED (Text + Icon) */}
      <button
        onClick={onDropSeeds}
        aria-label="Feed seeds to pigeons"
        title="Feed seeds (or double-click ground)"
        className="h-7.5 sm:h-8 px-2 sm:px-2.5 rounded-lg bg-[#FEF08A] hover:bg-[#FACC15] active:bg-[#EAB308] text-[#27272A] border-[1.5px] border-[#27272A] flex items-center gap-1 shadow-retro-sm active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none cursor-pointer transition-all shrink-0 font-bold"
      >
        <SeedsIcon size={14} />
        <span className="text-xs leading-none">Feed</span>
      </button>

      {/* 8. FOLLOW (Text + Icon) */}
      <button
        onClick={onToggleFollow}
        aria-label={isFollowingPigeon ? 'Stop following pigeon' : 'Follow pigeon camera'}
        title={isFollowingPigeon ? 'Stop following' : 'Follow pigeon camera'}
        className={`h-7.5 sm:h-8 px-2 sm:px-2.5 rounded-lg border-[1.5px] border-[#27272A] flex items-center gap-1 shadow-retro-sm active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none cursor-pointer transition-all shrink-0 font-bold ${
          isFollowingPigeon
            ? 'bg-[#FB923C] text-white ring-1 ring-[#27272A]'
            : 'bg-white hover:bg-[#FED7AA] text-[#27272A]'
        }`}
      >
        <FollowBirdieIcon size={14} />
        <span className="text-xs leading-none">Follow</span>
      </button>

      {/* 9. SCATTER (Text + Icon) */}
      <button
        onClick={onScatterAll}
        aria-label="Scatter flock into flight"
        title="Scatter flock into flight"
        className="h-7.5 sm:h-8 px-2 sm:px-2.5 rounded-lg bg-[#BEF264] hover:bg-[#A3E635] active:bg-[#84CC16] text-[#27272A] border-[1.5px] border-[#27272A] flex items-center gap-1 shadow-retro-sm active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none cursor-pointer transition-all shrink-0 font-bold"
      >
        <ScatterIcon size={14} />
        <span className="text-xs leading-none">Scatter</span>
      </button>
    </div>
  );

  return (
    <header className="fixed top-2 sm:top-2.5 md:top-3 left-1/2 -translate-x-1/2 z-30 w-fit max-w-[calc(100vw-16px)] flex justify-center select-none pointer-events-auto">
      {/* 
        Bulletproof Retro Control Bar:
        - Mobile (< 640px): 3 balanced, compact rows (~210px each) that will NEVER touch borders or overflow.
        - Tablet (640px to 979px): 2 centered rows (~340px each).
        - Laptop (>= 980px): 1 single horizontal row (~680px).
        - Always hugs contents with w-fit, padding on all sides, zero clipping.
      */}
      <div className="bg-[#BAE6FD] border-[2px] border-[#27272A] rounded-xl sm:rounded-2xl shadow-retro-window p-1.5 sm:p-2 transition-all w-fit max-w-full">
        <div className="retro-grid-bg border-[1.5px] border-[#27272A] rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 flex flex-col items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap text-[#27272A] w-fit max-w-full">

          {/* === MOBILE LAYOUT (< 640px): 3 Compact, Balanced Rows === */}
          {isMobile && (
            <>
              {/* Row 1: System & Scenery */}
              <div className="w-fit flex items-center justify-center">
                {renderUnitA()}
              </div>

              {/* Row 2: Time & Pigeon Flock Stepper */}
              <div className="w-fit flex items-center justify-center gap-2">
                {renderUnitB()}
                <div className="w-[1.2px] h-5 bg-[#27272A]/20 shrink-0 mx-0.5" aria-hidden="true" />
                {renderUnitC()}
              </div>

              {/* Row 3: Gameplay Actions */}
              <div className="w-fit flex items-center justify-center">
                {renderUnitD()}
              </div>
            </>
          )}

          {/* === TABLET LAYOUT (640px to 979px): 2 Centered Rows === */}
          {isTablet && (
            <>
              {/* Row 1: System, Scenery & Time */}
              <div className="w-fit flex items-center justify-center gap-2">
                {renderUnitA()}
                <div className="w-[1.2px] h-5 bg-[#27272A]/20 shrink-0 mx-0.5" aria-hidden="true" />
                {renderUnitB()}
              </div>

              {/* Row 2: Pigeon Flock & Actions */}
              <div className="w-fit flex items-center justify-center gap-2">
                {renderUnitC()}
                <div className="w-[1.2px] h-5 bg-[#27272A]/20 shrink-0 mx-0.5" aria-hidden="true" />
                {renderUnitD()}
              </div>
            </>
          )}

          {/* === LAPTOP / DESKTOP LAYOUT (>= 980px): 1 Single Continuous Line === */}
          {!isMobile && !isTablet && (
            <div className="w-fit flex items-center justify-center gap-2">
              {renderUnitA()}
              <div className="w-[1.2px] h-5 bg-[#27272A]/20 shrink-0 mx-0.5" aria-hidden="true" />
              {renderUnitB()}
              <div className="w-[1.2px] h-5 bg-[#27272A]/20 shrink-0 mx-0.5" aria-hidden="true" />
              {renderUnitC()}
              <div className="w-[1.2px] h-5 bg-[#27272A]/20 shrink-0 mx-0.5" aria-hidden="true" />
              {renderUnitD()}
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
