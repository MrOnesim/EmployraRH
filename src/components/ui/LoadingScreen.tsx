import Spinner from './Spinner';

interface LoadingScreenProps {
  message?: string;
  fullPage?: boolean;
}

export default function LoadingScreen({ message, fullPage }: LoadingScreenProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 min-h-[400px]">
      <Spinner size="lg" />
      {message && <p className="text-sm text-gray-500">{message}</p>}
    </div>
  );

  if (fullPage) {
    return <div className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center">{content}</div>;
  }

  return content;
}
