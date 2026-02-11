interface StatusCardProps {
  title: string;
  status: 'ok' | 'error' | 'loading';
  message: string;
}

export default function StatusCard({ title, status, message }: StatusCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'ok':
        return 'bg-green-100 border-green-500 text-green-800';
      case 'error':
        return 'bg-red-100 border-red-500 text-red-800';
      case 'loading':
        return 'bg-gray-100 border-gray-500 text-gray-800';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'ok':
        return '✓';
      case 'error':
        return '✗';
      case 'loading':
        return '⟳';
      default:
        return '?';
    }
  };

  return (
    <div className={`border-l-4 p-4 rounded-lg shadow-md ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-2xl font-bold">{getStatusIcon()}</span>
      </div>
      <p className="mt-2 text-sm">{message}</p>
      <div className="mt-2">
        <span className="inline-block px-2 py-1 text-xs font-semibold rounded uppercase">
          {status}
        </span>
      </div>
    </div>
  );
}
