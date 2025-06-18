import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar, MapPin, Users, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

type Service = {
  id: string;
  title: string;
  description: string;
  category: string;
  requirements: string;
  min_participants: number;
  max_participants: number;
  start_date: string;
  end_date: string;
  location_type: string;
  location_address: string;
  location_details: string;
};

export function ParticipantRegistration() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    notes: '',
    dietary_requirements: '',
    accessibility_needs: '',
  });

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
    } catch (error: any) {
      console.error('Error fetching service:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { error: registrationError } = await supabase
        .from('participant_registrations')
        .insert({
          service_id: serviceId,
          participant_id: user.id,
          ...formData,
          status: 'pending'
        });

      if (registrationError) throw registrationError;

      navigate('/services', { 
        state: { message: 'Registration submitted successfully!' }
      });
    } catch (err: any) {
      console.error('Error submitting registration:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!service) {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Register as Participant
          </h1>
          <div className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-2">
              {service.title}
            </h2>
            <p className="text-blue-700 mb-4">{service.description}</p>
            <div className="space-y-2">
              <div className="flex items-center text-blue-700">
                <Calendar className="w-5 h-5 mr-2" />
                <span>{format(new Date(service.start_date), 'PPP')}</span>
              </div>
              <div className="flex items-center text-blue-700">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{service.location_address}</span>
              </div>
              <div className="flex items-center text-blue-700">
                <Users className="w-5 h-5 mr-2" />
                <span>Participants: {service.min_participants}-{service.max_participants}</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Any additional information you'd like to share..."
            />
          </div>

          <div>
            <label htmlFor="dietary_requirements" className="block text-sm font-medium text-gray-700 mb-1">
              Dietary Requirements
            </label>
            <textarea
              id="dietary_requirements"
              rows={2}
              value={formData.dietary_requirements}
              onChange={(e) => setFormData({ ...formData, dietary_requirements: e.target.value })}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Any dietary restrictions or preferences..."
            />
          </div>

          <div>
            <label htmlFor="accessibility_needs" className="block text-sm font-medium text-gray-700 mb-1">
              Accessibility Needs
            </label>
            <textarea
              id="accessibility_needs"
              rows={2}
              value={formData.accessibility_needs}
              onChange={(e) => setFormData({ ...formData, accessibility_needs: e.target.value })}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Any accessibility requirements..."
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Submit Registration
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/services')}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}