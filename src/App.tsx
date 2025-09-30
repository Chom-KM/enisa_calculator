import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Layout from "./components/Layout";
import CalculatorPage from "./pages/CalculatorPage";
import DPCFilterPage from "./pages/DPCFilterPage";
import { initGA, logPageView } from "./components/Analytics";

const App = () => {
  const location = useLocation();

  useEffect(() => {
    initGA();
  }, []);

  useEffect(() => {
    logPageView(location.pathname + location.search);

    // Set page title based on route
    switch (location.pathname) {
      case "/enisa_calculator/":
        document.title = "ENISA Calculator";
        break;
      case "/enisa_calculator/filter":
        document.title = "DPC Filter Tool";
        break;
      default:
        document.title = "Disclaimer";
    }
  }, [location]);

  return (
    <Layout>
      <Routes>
        <Route path="/enisa_calculator" element={<CalculatorPage />} />
        <Route path="/enisa_calculator/filter" element={<DPCFilterPage />} />
      </Routes>
    </Layout>
  );
};

export default App;
