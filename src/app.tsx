import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DietPlans } from "./diet-plans/diet-plans";
import { DietPlanRoute } from "./diet-plan/diet-plan";
import { Box } from "@mui/joy";

function App() {
  return (
    <Box p={4}>
      <BrowserRouter>
        <Routes>
          <Route index element={<DietPlans />} />
          <Route path={":dietPlanId"} element={<DietPlanRoute />} />
        </Routes>
      </BrowserRouter>
    </Box>
  );
}

export default App;
