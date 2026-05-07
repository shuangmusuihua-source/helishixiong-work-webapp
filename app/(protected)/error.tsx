'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-8 px-4 text-center">
      <div className="card p-6 max-w-md mx-auto">
        <h2 className="text-lg font-bold mb-3">操作失败</h2>
        <p className="text-muted-foreground text-sm mb-4">
          {error.message || '请稍后重试'}
        </p>
        <button
          onClick={() => reset()}
          className="btn btn-primary text-sm"
        >
          重试
        </button>
      </div>
    </div>
  );
}