import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Login from "./pages/Login";
import DataPage from "./pages/DataPage";

const AppRoutes = () => {
  const location = useLocation();
  const query = location.search;
  const token = localStorage.getItem("token");

  return (
    <Routes>
      <Route
        path="/"
        element={
          token ? (
            <Navigate to={`/data${query}`} replace />
          ) : (
            <Navigate to={`/login${query}`} replace />
          )
        }
      />
      <Route path="/login" element={<Login />} />
      <Route
        path="/data"
        element={
          token ? <DataPage /> : <Navigate to={`/login${query}`} replace />
        }
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;
