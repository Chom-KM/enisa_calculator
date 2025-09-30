import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import CalculatorPage from "./pages/CalculatorPage";
import DPCFilterPage from "./pages/DPCFilterPage";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/enisa_calculator" element={<CalculatorPage />} />
          <Route path="/enisa_calculator/filter" element={<DPCFilterPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
