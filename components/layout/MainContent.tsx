'use client';

import { useWizardStore } from '@/store/useWizardStore';
import { ModeSelectStep } from '@/components/wizard/ModeSelectStep';
import { InputStep } from '@/components/wizard/InputStep';
import { OutlineStep } from '@/components/wizard/OutlineStep';
import { ThemeStep } from '@/components/wizard/ThemeStep';
import { AdvancedThemeStep } from '@/components/wizard/AdvancedThemeStep';
import { AdvancedOptionsStep } from '@/components/wizard/AdvancedOptionsStep';
import { GenerateStep } from '@/components/wizard/GenerateStep';
import { ExportStep } from '@/components/wizard/ExportStep';

export function MainContent() {
  const { currentStep, workMode } = useWizardStore();

  const renderStep = () => {
    // Step 0 is mode selection (shared)
    if (currentStep === 0) {
      return <ModeSelectStep />;
    }

    // Template mode steps
    if (workMode === 'template') {
      switch (currentStep) {
        case 1:
          return <InputStep />;
        case 2:
          return <OutlineStep />;
        case 3:
          return <ThemeStep />;
        case 4:
          return <GenerateStep />;
        case 5:
          return <ExportStep />;
        default:
          return <ModeSelectStep />;
      }
    }

    // Advanced mode steps
    // Step 1: Input (shared)
    // Step 2: Outline (shared)
    // Step 3: Advanced Theme Selection
    // Step 3.5: Advanced Options (inserted between theme and generate)
    // Step 4: Generate
    // Step 5: Export
    switch (currentStep) {
      case 1:
        return <InputStep />;
      case 2:
        return <OutlineStep />;
      case 3:
        return <AdvancedThemeStep />;
      case 4:
        return <AdvancedOptionsStep />;
      case 5:
        return <GenerateStep />;
      case 6:
        return <ExportStep />;
      default:
        return <ModeSelectStep />;
    }
  };

  // Generate and Export steps don't need extra scroll container
  const needsScroll = (workMode === 'template' && currentStep < 4) ||
                      (workMode === 'advanced' && currentStep < 5);

  return (
    <main className="main-content">
      {needsScroll ? (
        <div className="h-full overflow-y-auto">
          {renderStep()}
        </div>
      ) : (
        renderStep()
      )}
    </main>
  );
}