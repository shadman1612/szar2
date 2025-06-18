import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, GraduationCap, Briefcase, Calendar, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

type Service = {
  id: string;
  title: string;
  description: string;
  category: string;
  start_date: string;
  location_type: string;
  location_address: string;
};

export function Home() {
  const [upcomingEvents, setUpcomingEvents] = useState<Service[]>([]);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  async function fetchUpcomingEvents() {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(3);

      if (error) throw error;
      setUpcomingEvents(data || []);
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
    }
  }

  const features = [
    {
      icon: <Heart className="w-12 h-12 text-red-500" />,
      title: "Community Support",
      description: "Connect with volunteers ready to help with various needs"
    },
    {
      icon: <Users className="w-12 h-12 text-blue-500" />,
      title: "Language Exchange",
      description: "Practice languages with native speakers"
    },
    {
      icon: <GraduationCap className="w-12 h-12 text-green-500" />,
      title: "Student Opportunities",
      description: "Earn volunteer hours while making a difference"
    },
    {
      icon: <Briefcase className="w-12 h-12 text-purple-500" />,
      title: "Professional Help",
      description: "Access employment and recovery support services"
    }
  ];

  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Szar
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Building stronger communities through volunteer service and mutual support
        </p>
        <div className="mt-8 space-x-4">
          <Link
            to="/services"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Find Services
          </Link>
          <Link
            to="/auth"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Become a Volunteer
          </Link>
        </div>
      </section>

      {/* Upcoming Events Section */}
      {upcomingEvents.length > 0 && (
        <section className="bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Events</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {upcomingEvents.map(event => (
              <Link
                key={event.id}
                to={`/services/${event.id}`}
                className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition"
              >
                <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600 text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{format(new Date(event.start_date), 'PPP')}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>
                      {event.location_type 
                        ? event.location_type.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')
                        : 'Location not specified'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link
              to="/services"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All Events
            </Link>
          </div>
        </section>
      )}

      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition"
          >
            <div className="mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </section>

      <section className="bg-white rounded-xl p-8 shadow-sm">
        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
            <p className="text-gray-600">Create an account as a volunteer or service seeker</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Connect</h3>
            <p className="text-gray-600">Browse services or volunteer opportunities</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Make an Impact</h3>
            <p className="text-gray-600">Help others and strengthen your community</p>
          </div>
        </div>
      </section>
    </div>
  );
}