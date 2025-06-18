import React from "react";
import { Shield, Users, Heart, BookOpen } from "lucide-react";

const AboutUs = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-3xl font-bold mb-6">About Us</h1>
        
        <div className="prose max-w-none space-y-8">
          <section>
            <p className="text-lg text-gray-600 leading-relaxed">
              Welcome to our community initiative. We are dedicated to supporting and empowering individuals 
              through meaningful services and outreach programs. Our mission is to make a positive impact 
              in the lives of those we serve while ensuring the highest standards of safety and trust.
            </p>
          </section>

          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Safety First</h2>
              </div>
              <p className="text-gray-600">
                Your safety is our top priority. We work closely with local authorities and maintain strict 
                safety protocols to ensure a secure environment for all community members. Every volunteer 
                undergoes thorough screening and training.
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Inclusive Community</h2>
              </div>
              <p className="text-gray-600">
                We foster an inclusive environment where everyone feels welcome and respected. Our 
                volunteers receive comprehensive training in cultural sensitivity and inclusive practices.
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">Volunteer Training</h2>
              </div>
              <p className="text-gray-600">
                All volunteers complete mandatory training programs covering safety protocols, 
                emergency procedures, and best practices for community service. We ensure our team 
                is well-prepared to serve.
              </p>
            </div>

            <div className="bg-red-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-6 h-6 text-red-600" />
                <h2 className="text-xl font-semibold text-gray-900">Community Protection</h2>
              </div>
              <p className="text-gray-600">
                We maintain strong partnerships with local authorities and community organizations 
                to create a safe and supportive network. Regular safety audits and updates ensure 
                we meet the highest standards of community protection.
              </p>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Our Commitment to You</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Regular background checks for all volunteers</li>
              <li>Comprehensive safety training and protocols</li>
              <li>Partnership with local law enforcement</li>
              <li>24/7 support for community members</li>
              <li>Regular safety audits and improvements</li>
              <li>Inclusive and respectful environment for all</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;