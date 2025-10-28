import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ConsultationChat from './pages/ConsultationChat';
import Result from './pages/Result';
import Ranking from './pages/Ranking';
import History from './pages/History';
import Cases from './pages/Cases';

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/consultation/:caseId" element={<ConsultationChat />} />
        <Route path="/result" element={<Result />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/history" element={<History />} />
      </Routes>
  );
}

export default App;