'use client';

import { useState } from 'react';
import { useWizardStore } from '@/store/useWizardStore';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DesignSystemPanel } from './DesignSystemPanel';
import { Code2, Palette, Settings2, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InspectorPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InspectorPanel({ isOpen, onClose }: InspectorPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { slidePages, currentSlideIndex } = useWizardStore();

  const currentHtml = slidePages[currentSlideIndex] || '';

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'absolute top-0 right-0 h-full bg-background/95 backdrop-blur-xl border-l border-border z-50 transition-all duration-300',
        isCollapsed ? 'w-12' : 'w-80'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">检查器</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isCollapsed ? (
        <div className="flex flex-col items-center gap-2 p-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Palette className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Code2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="design" className="h-[calc(100%-48px)]">
          <TabsList className="w-full justify-start px-3 pt-2">
            <TabsTrigger value="design" className="text-xs">
              <Palette className="h-3 w-3 mr-1" />
              设计
            </TabsTrigger>
            <TabsTrigger value="code" className="text-xs">
              <Code2 className="h-3 w-3 mr-1" />
              代码
            </TabsTrigger>
          </TabsList>

          <TabsContent value="design" className="h-[calc(100%-40px)] overflow-y-auto m-0">
            <DesignSystemPanel />
          </TabsContent>

          <TabsContent value="code" className="h-[calc(100%-40px)] overflow-y-auto m-0 p-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  当前页面 HTML
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => navigator.clipboard.writeText(currentHtml)}
                >
                  复制
                </Button>
              </div>
              <pre className="text-xs p-3 bg-muted/50 rounded overflow-x-auto max-h-96">
                {currentHtml.slice(0, 2000)}
                {currentHtml.length > 2000 && '\n...'}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
