import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const ThankYouSponsor = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 rounded-full p-3">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Thank You for Your Interest!
        </h1>
        
        <p className="text-gray-600 mb-8">
          We've received your sponsorship application and will be in touch soon.
          Thank you for your commitment to supporting our community initiatives.
        </p>

        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default ThankYouSponsor;