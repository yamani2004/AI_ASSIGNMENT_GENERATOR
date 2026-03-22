import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Props {
  status: string;
}

export default function StatusBadge({ status }: Props) {
  const config: Record<string, { icon: React.ReactNode; className: string; label: string }> = {
    pending: {
      icon: <Clock className="w-3.5 h-3.5" />,
      className: 'bg-yellow-100 text-yellow-700',
      label: 'Pending',
    },
    processing: {
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
      className: 'bg-blue-100 text-blue-700',
      label: 'Processing',
    },
    completed: {
      icon: <CheckCircle className="w-3.5 h-3.5" />,
      className: 'bg-green-100 text-green-700',
      label: 'Completed',
    },
    failed: {
      icon: <XCircle className="w-3.5 h-3.5" />,
      className: 'bg-red-100 text-red-700',
      label: 'Failed',
    },
  };

  const c = config[status] || config.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.className}`}>
      {c.icon}
      {c.label}
    </span>
  );
}