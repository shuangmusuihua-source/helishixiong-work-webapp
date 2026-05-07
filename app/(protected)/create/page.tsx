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
import { useEffect } from 'react';

export default function CreatePage() {
  const { currentStep, workMode, reset } = useWizardStore();

  useEffect(() => {
    return () => {
      // Reset wizard state when leaving the page
      reset();
    };
  }, [reset]);

  const renderStep = () => {
    if (currentStep === 0) {
      return <ModeSelectStep />;
    }

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

  const needsScroll = (workMode === 'template' && currentStep < 4) ||
                      (workMode === 'advanced' && currentStep < 5);

  return (
    <div className="h-full">
      {needsScroll ? (
        <div className="h-full overflow-y-auto rounded-2xl">
          {renderStep()}
        </div>
      ) : (
        renderStep()
      )}
    </div>
  );
}
