import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import LinkLite from './components/LinkLite';
import { useEffect } from 'react';
import ShortlinkGratis from './pages/ShortlinkGratis';
import NggoVsLinktree from './pages/NggoVsLinktree';

function RedirectShort() {
  const { shortcode } = useParams();

  useEffect(() => {
    console.log("Redirecting to: ", shortcode);
    if (shortcode) {
      window.location.replace(`https://link.nggo.site/${shortcode}`);
    }
  }, [shortcode]);

  return <p>Redirecting to link.nggo.site/{shortcode}...</p>;
}


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LinkLite />} />
        <Route path="/shortlink-gratis" element={<ShortlinkGratis />} />
        <Route path="/nggo-vs-linktree" element={<NggoVsLinktree />} />
        <Route path="/:shortcode" element={<RedirectShort />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
