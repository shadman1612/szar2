import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar, MapPin, Users, Clock, Tag } from 'lucide-react';
import { format } from 'date-fns';

type Service = {
  id: string;
  title: string;
  description: string;
  category: string;
  requirements: string;
  volunteer_hours_reward: number;
  min_participants: number;
  max_participants: number;
  min_volunteers: number;
  max_volunteers: number;
  start_date: string;
  end_date: string;
  is_recurring: boolean;
  recurrence_pattern: string;
  location_type: string;
  location_address: string;
  location_details: string;
};

export function ServiceDetails() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServiceDetails();
  }, [serviceId]);

  async function fetchServiceDetails() {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();

      if (error) throw error;
      setService(data);
    } catch (err: any) {
      console.error('Error fetching service:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Service not found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{service.title}</h1>
          <p className="text-gray-600 text-lg mb-6">{service.description}</p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-5 h-5 mr-2" />
                <span>
                  {format(new Date(service.start_date), 'PPP')} at{' '}
                  {format(new Date(service.start_date), 'p')}
                </span>
              </div>

              <div className="flex items-center text-gray-600">
                <Clock className="w-5 h-5 mr-2" />
                <span>Duration: {format(new Date(service.start_date), 'p')} - {format(new Date(service.end_date), 'p')}</span>
              </div>

              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-2" />
                <div>
                  <div>{service.location_type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</div>
                  <div className="text-sm">{service.location_address}</div>
                  {service.location_details && (
                    <div className="text-sm text-gray-500">{service.location_details}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center text-gray-600">
                <Tag className="w-5 h-5 mr-2" />
                <span className="capitalize">{service.category}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <Users className="w-5 h-5 mr-2" />
                <span>Participants: {service.min_participants}-{service.max_participants}</span>
              </div>

              <div className="flex items-center text-gray-600">
                <Users className="w-5 h-5 mr-2" />
                <span>Volunteers needed: {service.min_volunteers}-{service.max_volunteers}</span>
              </div>

              {service.volunteer_hours_reward > 0 && (
                <div className="text-green-600">
                  Volunteer Hours Reward: {service.volunteer_hours_reward} hours
                </div>
              )}

              {service.is_recurring && (
                <div className="text-gray-600">
                  Recurring: {service.recurrence_pattern}
                </div>
              )}
            </div>
          </div>

          {service.requirements && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Requirements</h2>
              <p className="text-gray-600">{service.requirements}</p>
            </div>
          )}

          <div className="mt-8 flex gap-4">
            <button
              onClick={() => navigate(`/services/${service.id}/volunteer`)}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Apply to Volunteer
            </button>
            <button
              onClick={() => navigate(`/services/${service.id}/participate`)}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Register as Participant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}