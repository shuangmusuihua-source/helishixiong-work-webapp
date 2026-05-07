'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="card p-8 text-center max-w-md">
        <h2 className="text-xl font-bold mb-4">出错了</h2>
        <p className="text-muted-foreground mb-6">
          {error.message || '发生了意外错误，请稍后重试'}
        </p>
        <button
          onClick={() => reset()}
          className="btn btn-primary"
        >
          重试
        </button>
      </div>
    </div>
  );
}