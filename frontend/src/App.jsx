import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import WeatherDashboard from "./pages/WeatherDashboard";
import CropRecommendation from "./pages/CropRecommendation";

import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/crop-recommendation"
                            replace
                        />
                    }
                />

                <Route
                    path="/crop-recommendation"
                    element={<CropRecommendation />}
                />

                <Route
                    path="/weather"
                    element={<WeatherDashboard />}
                />

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/crop-recommendation"
                            replace
                        />
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;