import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/DashbordPage";
import Transaction from "./pages/TransactionPage";
import Budgets from "./pages/BudgetsPage";
import Goals from "./pages/FinancialGoalsPage"; // Fix typo in import path
import Login from "./pages/SignInPage";
import Register from "./pages/SignUpPage";
import Home from "./pages/HomePage";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./context/ProtectedRoute"; // Import the ProtectedRoute component

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} /> {/* Home Page is public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute> {/* Wrap protected routes in ProtectedRoute */}
            <Layout />
          </ProtectedRoute>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="transaction" element={<Transaction />} />
            <Route path="budgets" element={<Budgets />} />
            <Route path="goals" element={<Goals />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
