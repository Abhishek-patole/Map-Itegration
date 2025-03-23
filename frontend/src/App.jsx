import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import FindRide from "./pages/FindRide";
import CreateRide from "./pages/CreateRide";
import RideStatus from "./components/RideStatus";
import DriverTracking from "./components/DriverTracking";
import PassengerTracking from "./components/PassengerTracking";
import ConfirmRide from "./pages/ConfirmRide";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/find-ride" element={<FindRide />} />
        <Route path="/create-ride" element={<CreateRide />} />

        <Route path="/confirm-ride/:rideId" element={<ConfirmRide />} />
        <Route path="/ride-status/:rideId" element={<RideStatus />} />
        <Route path="/driver-tracking/:rideId" element={<DriverTracking />} />
        <Route path="/passenger-tracking/:rideId" element={<PassengerTracking />} />
      </Routes>
    </Router>
  );
};

export default App;
