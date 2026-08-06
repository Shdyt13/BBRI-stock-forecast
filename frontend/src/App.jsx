import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FeatureSelection from './pages/FeatureSelection';
import ModelEvaluation from './pages/ModelEvaluation';

function App() {
  return (
    <DataProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="feature-selection" element={<FeatureSelection />} />
            <Route path="model-evaluation" element={<ModelEvaluation />} />
          </Route>
        </Routes>
      </Router>
    </DataProvider>
  );
}

export default App;
