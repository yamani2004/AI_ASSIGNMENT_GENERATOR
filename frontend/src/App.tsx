import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import CreateAssessment from './pages/CreateAssessment';
import ViewAssessment from './pages/ViewAssessment';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreateAssessment />} />
          <Route path="/assessment/:id" element={<ViewAssessment />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}