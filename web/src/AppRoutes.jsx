import { Routes, Route, useLocation } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Index from "./pages/Index";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import CallSummary from "./pages/CallSummary";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

export default function AppRoutes() {
  const location = useLocation();

  return (
    <Routes>
      {/* Routes with MainLayout */}
      <Route element={<MainLayout />}>
        <Route
          index
          element={
            <Index
              key={location.key}
            />
          }
        />
        <Route
          path="/:encryptedId"
          element={
            <Index
              key={location.key}
            />
          }
        />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/call-summary" element={<CallSummary />} />
      </Route>

      {/* Standalone routes */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/register" element={<Register />} />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
