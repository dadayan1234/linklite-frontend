import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import LinkLite from './components/LinkLite';
import { useEffect } from 'react';
import ShortlinkGratis from './pages/ShortlinkGratis';
import NggoVsLinktree from './pages/NggoVsLinktree';
import About from './pages/About';
import Faq from './pages/Faq';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

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
        <Route path="/tentang" element={<About />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/:shortcode" element={<RedirectShort />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
