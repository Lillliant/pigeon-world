/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { SceneManager } from './scene/sceneManager';
import { Header } from './components/Header';
import { InfoModal } from './components/InfoModal';
import { soundManager } from './audio/soundManager';
import { TimeOfDay, SceneryType } from './types';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);

  const [pigeonCount, setPigeonCount] = useState<number>(28);
  const [timeProgress, setTimeProgress] = useState<number>(33);
  const [isFollowingPigeon, setIsFollowingPigeon] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [currentScenery, setCurrentScenery] = useState<SceneryType>('forest');

  // Initialize SceneManager
  useEffect(() => {
    if (!containerRef.current) return;

    const manager = new SceneManager(containerRef.current);
    sceneManagerRef.current = manager;

    return () => {
      manager.dispose();
      sceneManagerRef.current = null;
    };
  }, []);

  // Update pigeon count when changed
  const handlePigeonCountChange = useCallback((count: number) => {
    setPigeonCount(count);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.updateFlockCount(count);
    }
  }, []);

  // Drop seeds
  const handleDropSeeds = useCallback(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.dropSeedsInCenter();
    }
  }, []);

  // Scatter flock
  const handleScatterAll = useCallback(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.scatterAll();
    }
  }, []);

  // Reset camera
  const handleResetCamera = useCallback(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.resetCamera();
      setIsFollowingPigeon(false);
    }
  }, []);

  // Toggle follow pigeon
  const handleToggleFollow = useCallback(() => {
    if (sceneManagerRef.current) {
      const active = sceneManagerRef.current.toggleFollowPigeon();
      setIsFollowingPigeon(active);
    }
  }, []);

  // Change time of day continuously via slider
  const handleTimeProgressChange = useCallback((progress: number) => {
    setTimeProgress(progress);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setTimeProgress(progress);
    }
  }, []);

  // Preset time click
  const handlePresetTimeChange = useCallback((time: TimeOfDay) => {
    const map: Record<TimeOfDay, number> = {
      morning: 0,
      noon: 33,
      sunset: 66,
      twilight: 100,
    };
    const progress = map[time];
    setTimeProgress(progress);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setTimeProgress(progress);
    }
  }, []);

  // Toggle mute
  const handleToggleMute = useCallback(() => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  }, []);

  // Change Scenery
  const handleSelectScenery = useCallback((scenery: SceneryType) => {
    setCurrentScenery(scenery);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setScenery(scenery);
    }
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden select-none touch-none">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full cursor-crosshair"
      />

      {/* Thinner, sleek pastel control bar */}
      <Header
        pigeonCount={pigeonCount}
        onPigeonCountChange={handlePigeonCountChange}
        timeProgress={timeProgress}
        onTimeProgressChange={handleTimeProgressChange}
        onPresetTimeChange={handlePresetTimeChange}
        isFollowingPigeon={isFollowingPigeon}
        onToggleFollow={handleToggleFollow}
        onDropSeeds={handleDropSeeds}
        onScatterAll={handleScatterAll}
        onResetCamera={handleResetCamera}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenInfo={() => setIsInfoOpen(true)}
        currentScenery={currentScenery}
        onSelectScenery={handleSelectScenery}
      />

      {/* Info Guide Modal */}
      <InfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />
    </main>
  );
}
