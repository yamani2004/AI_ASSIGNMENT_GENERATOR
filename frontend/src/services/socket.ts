import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io('/', {
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function joinAssessment(assessmentId: string) {
  const s = getSocket();
  s.emit('join-assessment', assessmentId);
}

export function leaveAssessment(assessmentId: string) {
  const s = getSocket();
  s.emit('leave-assessment', assessmentId);
}

export function onStatusUpdate(callback: (data: {
  assessmentId: string;
  status: string;
  message: string;
}) => void) {
  const s = getSocket();
  s.on('status-update', callback);
  return () => {
    s.off('status-update', callback);
  };
}