import { useHealth } from '../hooks/useHealth';
import StatusCard from '../components/StatusCard';

export default function StatusPage() {
  const { data, loading, error, refetch } = useHealth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            System Status Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor the health of your full-stack application
          </p>
        </header>

        <div className="mb-6 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {data?.timestamp && (
              <span>Last updated: {new Date(data.timestamp).toLocaleString()}</span>
            )}
          </div>
          <button
            onClick={refetch}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Refreshing...' : 'Refresh Status'}
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Frontend Status */}
          <StatusCard
            title="Frontend"
            status="ok"
            message="React application is running successfully"
          />

          {/* Backend API Status */}
          {loading ? (
            <StatusCard
              title="Backend API"
              status="loading"
              message="Checking backend connection..."
            />
          ) : error ? (
            <StatusCard
              title="Backend API"
              status="error"
              message={error}
            />
          ) : (
            <StatusCard
              title="Backend API"
              status={data?.api.status || 'error'}
              message={data?.api.message || 'Unknown status'}
            />
          )}

          {/* Database Status */}
          {loading ? (
            <StatusCard
              title="Database"
              status="loading"
              message="Checking database connection..."
            />
          ) : error ? (
            <StatusCard
              title="Database"
              status="error"
              message="Unable to check database status"
            />
          ) : (
            <StatusCard
              title="Database"
              status={data?.database.status || 'error'}
              message={data?.database.message || 'Unknown status'}
            />
          )}
        </div>

        {/* Overall Status Summary */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Overall System Status</h2>
          {loading ? (
            <p className="text-gray-600">Loading system status...</p>
          ) : error ? (
            <div className="text-red-600">
              <p className="font-semibold">System Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          ) : (
            <div>
              <p className="text-lg">
                Status:{' '}
                <span
                  className={`font-bold ${
                    data?.status === 'ok' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {data?.status?.toUpperCase()}
                </span>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                All systems are {data?.status === 'ok' ? 'operational' : 'experiencing issues'}
              </p>
            </div>
          )}
        </div>

        {/* API Documentation Link */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            📚 API Documentation available at:{' '}
            <a
              href="http://localhost:3000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline hover:text-blue-600"
            >
              http://localhost:3000/docs
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
