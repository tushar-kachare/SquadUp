import { useEffect, useState } from 'react';

function App() {
  const [status, setStatus] = useState('checking...');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/health`)
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(() => setStatus('failed to connect'));
  }, []);

  return <div>Backend status: {status}</div>;
}

export default App;