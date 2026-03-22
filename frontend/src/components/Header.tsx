import { FileText, Plus, List } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <FileText className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">AI Assessment Creator</span>
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            to="/"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <List className="w-4 h-4" />
            Dashboard
          </Link>
          <Link to="/create" className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            New Assessment
          </Link>
        </nav>
      </div>
    </header>
  );
}