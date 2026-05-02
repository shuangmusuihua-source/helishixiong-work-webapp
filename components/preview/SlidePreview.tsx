'use client';

import { useRef, useEffect, useState } from 'react';

interface SlidePreviewProps {
  html: string;
  currentPage?: number;
  totalPages?: number;
}

export function SlidePreview({ html, currentPage = 1, totalPages = 1 }: SlidePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    if (iframeRef.current && html) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, [html]);

  return (
    <div className="preview-container h-full flex flex-col">
      <div className="preview-toolbar flex items-center justify-between p-2 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {currentPage} / {totalPages}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale(Math.max(0.25, scale - 0.1))}
            className="px-2 py-1 text-sm rounded hover:bg-muted"
          >
            -
          </button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale(Math.min(1, scale + 0.1))}
            className="px-2 py-1 text-sm rounded hover:bg-muted"
          >
            +
          </button>
        </div>
      </div>
      <div className="preview-content flex-1 overflow-auto bg-muted/30 p-4 flex items-center justify-center">
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            width: '1280px',
            height: '720px',
          }}
          className="shadow-xl rounded-lg overflow-hidden bg-white"
        >
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            title="幻灯片预览"
            sandbox="allow-scripts"
          />
        </div>
      </div>
    </div>
  );
}