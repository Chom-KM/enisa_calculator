import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import CalculatorPage from "./pages/CalculatorPage";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="*" element={<CalculatorPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
