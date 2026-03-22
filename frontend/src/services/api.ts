import axios from 'axios';
import type { AssessmentInput, Assessment } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export async function createAssessment(input: AssessmentInput) {
  const { data } = await api.post('/assessments', input);
  return data;
}

export async function getAssessment(id: string): Promise<{ success: boolean; data: Assessment }> {
  const { data } = await api.get(`/assessments/${id}`);
  return data;
}

export async function getAssessmentStatus(id: string) {
  const { data } = await api.get(`/assessments/${id}/status`);
  return data;
}

export async function listAssessments() {
  const { data } = await api.get('/assessments');
  return data;
}

export async function regenerateAssessment(id: string) {
  const { data } = await api.post(`/assessments/${id}/regenerate`);
  return data;
}

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/assessments/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export function getDownloadURL(id: string) {
  return `/api/assessments/${id}/pdf`;
}