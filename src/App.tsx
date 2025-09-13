import React from 'react';
import { Route, BrowserRouter as Router, Routes } from "react-router";
import View from "./pages/index/View";
function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<View/>} />

        </Routes>
      </Router>
  );
}

export default App;
