import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { ChatWidget } from './components/ChatWidget';
import { Home } from './pages/Home';
import { Services } from './pages/Services';
import { ServiceDetails } from './pages/ServiceDetails';
import { CreateService } from './pages/CreateService';
import { EditService } from './pages/EditService';
import { VolunteerApplication } from './pages/VolunteerApplication';
import { ParticipantRegistration } from './pages/ParticipantRegistration';
import { Profile } from './pages/Profile';
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import BecomeSponsor from "./pages/BecomeSponsor";
import ThankYouSponsor from "./pages/ThankYouSponsor";
import { Auth } from './pages/Auth';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:serviceId" element={<ServiceDetails />} />
            <Route path="/services/create" element={<CreateService />} />
            <Route path="/services/:serviceId/edit" element={<EditService />} />
            <Route path="/services/:serviceId/volunteer" element={<VolunteerApplication />} />
            <Route path="/services/:serviceId/participate" element={<ParticipantRegistration />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/become-a-sponsor" element={<BecomeSponsor />} />
            <Route path="/thank-you-sponsor" element={<ThankYouSponsor />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </main>
        <ChatWidget />
      </div>
    </Router>
  );
}

export default App;