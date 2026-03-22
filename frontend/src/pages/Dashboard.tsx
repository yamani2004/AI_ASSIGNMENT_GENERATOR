import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, RefreshCw } from 'lucide-react';
import { listAssessments } from '../services/api';
import StatusBadge from '../components/StatusBadge';

interface AssessmentListItem {
  _id: string;
  input: { title?: string; subject?: string };
  status: string;
  createdAt: string;
}

export default function Dashboard() {
  const [assessments, setAssessments] = useState<AssessmentListItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchList() {
    try {
      setLoading(true);
      const res = await listAssessments();
      if (res.success) setAssessments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Your generated assessments</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchList} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <Link to="/create" className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            New Assessment
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : assessments.length === 0 ? (
        <div className="card text-center py-16">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No assessments yet</h2>
          <p className="text-gray-500 mb-6">Create your first AI-generated assessment</p>
          <Link to="/create" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Assessment
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {assessments.map((a) => (
            <Link
              key={a._id}
              to={`/assessment/${a._id}`}
              className="card flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <h3 className="font-semibold text-gray-900">
                  {a.input?.title || 'Untitled Assessment'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {a.input?.subject || 'No subject'} • {new Date(a.createdAt).toLocaleDateString()}
                </p>
              </div>
              <StatusBadge status={a.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}