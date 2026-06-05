import { Routes, Route } from 'react-router-dom';
import { useBoard } from './api/queries.js';
import Dashboard from './components/Dashboard.js';
import LoginPage from './pages/LoginPage.js';

export default function App() {
  const { data: board, isLoading, isError } = useBoard();

  return (
    <Routes>
      <Route path="/log" element={<LoginPage />} />
      <Route
        path="/"
        element={
          isLoading ? (
            <Splash text="Loading…" />
          ) : isError || !board ? (
            <Splash text="Couldn't load the board. Is the server running?" />
          ) : (
            <Dashboard board={board} />
          )
        }
      />
      <Route path="*" element={<Splash text="404 — kuch nahi mila." />} />
    </Routes>
  );
}

function Splash({ text }: { text: string }) {
  return (
    <div className="flex h-full min-h-screen items-center justify-center text-muted">
      <div className="text-center">
        <div className="mb-2 text-4xl">🔥</div>
        <div>{text}</div>
      </div>
    </div>
  );
}
