import { Routes, Route } from 'react-router-dom';
import { useBoard } from './api/queries.js';
import Dashboard from './components/Dashboard.js';
import TasksPage from './pages/TasksPage.js';
import LoginPage from './pages/LoginPage.js';
import { Wordmark, AsciiSpinner } from './components/ui/index.js';

export default function App() {
  const { data: board, isLoading, isError } = useBoard();

  const gated = (ready: (b: NonNullable<typeof board>) => JSX.Element) =>
    isLoading ? (
      <Splash spinner text="loading…" />
    ) : isError || !board ? (
      <Splash text="couldn't load the board. is the server running?" />
    ) : (
      ready(board)
    );

  return (
    <Routes>
      <Route path="/log" element={<LoginPage />} />
      <Route path="/" element={gated((b) => <Dashboard board={b} />)} />
      <Route path="/tasks" element={gated((b) => <TasksPage board={b} />)} />
      <Route path="*" element={<Splash text="404 — kuch nahi mila." />} />
    </Routes>
  );
}

function Splash({ text, spinner = false }: { text: string; spinner?: boolean }) {
  return (
    <div className="paper-grain flex h-full min-h-screen items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <Wordmark variant="lockup" size="lg" />
        {spinner ? (
          <AsciiSpinner variant="bar" label={text} />
        ) : (
          <div className="text-sm lowercase text-muted">{text}</div>
        )}
      </div>
    </div>
  );
}
