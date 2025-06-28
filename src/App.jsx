import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import LinkLite from './components/LinkLite'

function RedirectShort() {
  const { shortcode } = useParams();
  return <Navigate to={`https://link.nggo.site/${shortcode}`} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LinkLite />} />
        <Route path="/:shortcode" element={<RedirectShort />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
