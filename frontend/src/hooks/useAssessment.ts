import { useState, useEffect, useCallback } from 'react';
import type { Assessment } from '../types';
import { getAssessment } from '../services/api';
import { joinAssessment, leaveAssessment, onStatusUpdate } from '../services/socket';

export function useAssessment(id: string | undefined) {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  const fetchAssessment = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await getAssessment(id);
      if (res.success) {
        setAssessment(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch assessment:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAssessment();
  }, [fetchAssessment]);

  useEffect(() => {
    if (!id) return;

    joinAssessment(id);

    const cleanup = onStatusUpdate((data) => {
      if (data.assessmentId === id) {
        setStatusMessage(data.message);
        if (data.status === 'completed' || data.status === 'failed') {
          fetchAssessment();
        }
        if (data.status === 'processing') {
          setAssessment(prev => prev ? { ...prev, status: 'processing' } : null);
        }
      }
    });

    return () => {
      leaveAssessment(id);
      cleanup();
    };
  }, [id, fetchAssessment]);

  return { assessment, loading, statusMessage, refetch: fetchAssessment };
}