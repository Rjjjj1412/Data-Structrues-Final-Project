import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Patientreg from "./pages/Patientreg";
import Doctorreg from "./pages/Doctorreg";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard"; // Import the PatientDashboard
import EditProfile from "./pages/EditProfile";
import PEditProfile from "./pages/PEditProfile";
import CreateSchedule from "./pages/CreateSchedule";
import AppointmentRequest from "./pages/AppointmentRequest";
import MyAppointment from "./pages/MyAppointment"; // Import the MyAppointment component
import DoctorsAppointment from "./pages/DoctorAppointments"; // Import DoctorsAppointment component
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/patient" element={<Patientreg />} />
        <Route path="/register/doctor" element={<Doctorreg />} />
        
        {/* Doctor Dashboard routes */}
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor-dashboard/edit-profile" element={<EditProfile />} />
        <Route path="/doctor-dashboard/create-schedule" element={<CreateSchedule />} />
        <Route path="/doctor-dashboard/appointments" element={<DoctorsAppointment />} /> {/* New route for DoctorsAppointment */}
        
        {/* Patient Dashboard routes */}
        <Route path="/patient-dashboard" element={<PatientDashboard />} /> {/* New route for Patient Dashboard */}
        <Route path="/patient-dashboard/pedit-profile" element={<PEditProfile />} />
        <Route path="/patient-dashboard/request" element={<AppointmentRequest />} />
        
        {/* My Appointments route */}
        <Route path="/patient-dashboard/my-appointments" element={<MyAppointment />} /> {/* New route for MyAppointments */}
      </Routes>
    </Router>
  );
}

export default App;
