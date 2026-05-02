import { Sidebar } from '@/components/layout/Sidebar';
import { MainContent } from '@/components/layout/MainContent';

export default function CreatePage() {
  return (
    <div className="wizard-container">
      <Sidebar />
      <MainContent />
    </div>
  );
}