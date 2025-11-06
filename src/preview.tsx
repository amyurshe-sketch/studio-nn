import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';

// Import global styles to match app look
import './App.css';
import './index.css';

// Pages we may want to preview
import UsersPage from './UsersPage';
import LeisurePage from './LeisurePage';
import StatsPage from './StatsPage';
import ProfilePage from './ProfilePage';
import HomePage from './HomePage';

// App providers used by pages (e.g., useAuth)
import { AuthProvider } from './hooks/useAuth';

const PAGES: Record<string, React.ReactNode> = {
  home: <HomePage />,
  users: <UsersPage />,
  leisure: <LeisurePage />,
  stats: <StatsPage />,
  profile: <ProfilePage />,
};

function getQueryPage(): keyof typeof PAGES {
  const params = new URLSearchParams(window.location.search);
  const page = (params.get('page') || '').toLowerCase();
  return (Object.keys(PAGES).includes(page) ? page : 'home') as keyof typeof PAGES;
}

function PreviewHost() {
  const [page, setPage] = React.useState(getQueryPage());

  React.useEffect(() => {
    const onPop = () => setPage(getQueryPage());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (next: keyof typeof PAGES) => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', next);
    history.pushState({}, '', url.toString());
    setPage(next);
  };

  return (
    <AuthProvider>
      <MemoryRouter>
        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {Object.keys(PAGES).map((key) => (
              <button
                key={key}
                onClick={() => navigate(key as keyof typeof PAGES)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  background: key === page ? '#e2e8f0' : 'white',
                  cursor: 'pointer',
                }}
              >
                {key}
              </button>
            ))}
          </div>
          <div>{PAGES[page]}</div>
        </div>
      </MemoryRouter>
    </AuthProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<PreviewHost />);

