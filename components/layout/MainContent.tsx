'use client';

import { useWizardStore } from '@/store/useWizardStore';
import { InputStep } from '@/components/wizard/InputStep';
import { OutlineStep } from '@/components/wizard/OutlineStep';
import { ThemeStep } from '@/components/wizard/ThemeStep';
import { GenerateStep } from '@/components/wizard/GenerateStep';
import { ExportStep } from '@/components/wizard/ExportStep';

export function MainContent() {
  const { currentStep } = useWizardStore();

  const renderStep = () => {
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
        return <InputStep />;
    }
  };

  return (
    <main className="main-content">
      {renderStep()}
    </main>
  );
}