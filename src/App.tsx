import React from 'react';
import { Route, BrowserRouter as Router, Routes } from "react-router";
function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<div className={'text-red-500'}>test</div>} />

        </Routes>
      </Router>
  );
}

export default App;
