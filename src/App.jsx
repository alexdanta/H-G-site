import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FamilySorter from './components/FamilySorter/FamilySorter';
import LandingPage from './LandingPage';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Main landing page route */}
          <Route path="/" element={<LandingPage />} />

          {/* Family sorting route */}
          <Route path="/sorting" element={<FamilySorter />} />

          {/* Catch all route - redirect to home or show 404 */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;