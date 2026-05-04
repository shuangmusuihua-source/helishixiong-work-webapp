'use client';

import { useWizardStore } from '@/store/useWizardStore';
import { ModeSelectStep } from '@/components/wizard/ModeSelectStep';
import { InputStep } from '@/components/wizard/InputStep';
import { OutlineStep } from '@/components/wizard/OutlineStep';
import { ThemeStep } from '@/components/wizard/ThemeStep';
import { GenerateStep } from '@/components/wizard/GenerateStep';
import { ExportStep } from '@/components/wizard/ExportStep';

export function MainContent() {
  const { currentStep } = useWizardStore();

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <ModeSelectStep />;
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
  };

  // 生成步骤不需要额外滚动容器
  const needsScroll = currentStep !== 4 && currentStep !== 5;

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