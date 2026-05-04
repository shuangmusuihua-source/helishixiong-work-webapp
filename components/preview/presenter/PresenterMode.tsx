'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useWizardStore } from '@/store/useWizardStore';
import { SlideCanvas } from '../SlideCanvas';
import { ControlBar } from './ControlBar';
import { ProgressBar } from './ProgressBar';
import { OverviewGrid } from './OverviewGrid';
import { LaserPointer } from './LaserPointer';
import { cn } from '@/lib/utils';

interface PresenterModeProps {
  onExit: () => void;
}

export function PresenterMode({ onExit }: PresenterModeProps) {
  const { slidePages, currentSlideIndex, setCurrentSlideIndex } = useWizardStore();

  const [index, setIndex] = useState(currentSlideIndex);
  const [blackout, setBlackout] = useState<'black' | 'white' | null>(null);
  const [laser, setLaser] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const [controlsVisible, setControlsVisible] = useState(true);
  const [idle, setIdle] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);

  const goPrev = useCallback(() => {
    if (index > 0) setIndex(index - 1);
  }, [index]);

  const goNext = useCallback(() => {
    if (index < slidePages.length - 1) setIndex(index + 1);
  }, [index, slidePages.length]);

  // 全屏生命周期
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    if (document.fullscreenElement !== el) {
      el.requestFullscreen?.().catch(() => {});
    }

    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    };
  }, []);

  // 监听全屏变化
  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) onExit();
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, [onExit]);

  // 键盘导航
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tgt = e.target;
      if (tgt instanceof HTMLElement && tgt.matches('input, textarea')) return;

      if (overviewOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setOverviewOpen(false);
        }
        return;
      }

      if (e.key === 'Escape') {
        if (blackout) {
          e.preventDefault();
          setBlackout(null);
          return;
        }
        onExit();
        return;
      }

      const isNext =
        e.key === 'ArrowRight' ||
        e.key === 'ArrowDown' ||
        e.key === ' ' ||
        e.key === 'PageDown';
      const isPrev =
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowUp' ||
        e.key === 'PageUp';

      if (isNext || isPrev) {
        if (blackout) setBlackout(null);
      }

      if (isNext) {
        e.preventDefault();
        goNext();
        return;
      }
      if (isPrev) {
        e.preventDefault();
        goPrev();
        return;
      }
      if (e.key === 'Home') {
        setIndex(0);
        return;
      }
      if (e.key === 'End') {
        setIndex(slidePages.length - 1);
        return;
      }

      if (e.altKey || e.ctrlKey || e.metaKey) return;

      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        setBlackout((c) => (c === 'black' ? null : 'black'));
      } else if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setBlackout((c) => (c === 'white' ? null : 'white'));
      } else if (e.key === 'o' || e.key === 'O') {
        e.preventDefault();
        setOverviewOpen((v) => !v);
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        setLaser((v) => !v);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [overviewOpen, blackout, onExit, goNext, goPrev, slidePages.length]);

  // 鼠标活动检测
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const onMove = () => {
      setControlsVisible(true);
      setIdle(false);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIdle(true);
        setControlsVisible(false);
      }, 2000);
    };

    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      clearTimeout(timeout);
    };
  }, []);

  // 同步索引到 store
  useEffect(() => {
    setCurrentSlideIndex(index);
  }, [index, setCurrentSlideIndex]);

  const currentHtml = slidePages[index] || '';

  return (
    <div
      ref={rootRef}
      className={cn(
        'relative flex h-screen w-screen items-center justify-center',
        blackout === 'black' ? 'bg-black' : blackout === 'white' ? 'bg-white' : 'bg-black',
        (idle || laser) && !controlsVisible && 'cursor-none',
      )}
    >
      {!blackout && <SlideCanvas html={currentHtml} />}

      {/* 点击导航区域 */}
      <button
        type="button"
        aria-label="上一页"
        onClick={goPrev}
        disabled={index === 0}
        className="absolute inset-y-0 left-0 z-10 w-[30%]"
      />
      <button
        type="button"
        aria-label="下一页"
        onClick={goNext}
        disabled={index === slidePages.length - 1}
        className="absolute inset-y-0 right-0 z-10 w-[30%]"
      />

      <ProgressBar
        index={index}
        total={slidePages.length}
        visible={controlsVisible}
      />

      <ControlBar
        index={index}
        total={slidePages.length}
        startedAt={startedAt}
        blackout={blackout}
        laser={laser}
        visible={controlsVisible}
        onPrev={goPrev}
        onNext={goNext}
        onBlackout={(mode) => setBlackout((c) => (c === mode ? null : mode))}
        onLaser={() => setLaser((v) => !v)}
        onOverview={() => setOverviewOpen(true)}
        onExit={onExit}
      />

      <LaserPointer enabled={laser} />

      <OverviewGrid
        pages={slidePages}
        current={index}
        open={overviewOpen}
        onClose={() => setOverviewOpen(false)}
        onSelect={setIndex}
      />
    </div>
  );
}
