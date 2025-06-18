import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Clock, FileText, User, CheckCircle } from 'lucide-react';

type Service = {
  id: string;
  title: string;
  description: string;
  category: string;
  requirements: string;
  volunteer_hours_reward: number;
};

export function VolunteerApplication() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    experience: '',
    availability: '',
    motivation: '',
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

      // Check if user is already a volunteer, if not, update profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_volunteer')
        .eq('id', user.id)
        .single();

      if (!profile?.is_volunteer) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ is_volunteer: true })
          .eq('id', user.id);

        if (updateError) throw updateError;
      }

      // Create volunteer application with additional details
      const { error: applicationError } = await supabase
        .from('volunteer_applications')
        .insert({
          service_id: serviceId,
          volunteer_id: user.id,
          experience: formData.experience,
          availability: formData.availability,
          motivation: formData.motivation,
          status: 'pending'
        });

      if (applicationError) throw applicationError;

      // Redirect to success page or service listing
      navigate('/services', { 
        state: { message: 'Application submitted successfully!' }
      });
    } catch (err: any) {
      console.error('Error submitting application:', err);
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
            Volunteer Application
          </h1>
          <div className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-2">
              {service.title}
            </h2>
            <p className="text-blue-700 mb-4">{service.description}</p>
            {service.requirements && (
              <div className="mb-4">
                <h3 className="font-medium text-blue-900 mb-2">Requirements:</h3>
                <p className="text-blue-700">{service.requirements}</p>
              </div>
            )}
            <div className="flex items-center text-blue-700">
              <Clock className="w-5 h-5 mr-2" />
              <span>{service.volunteer_hours_reward} volunteer hours</span>
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
            <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Relevant Experience</span>
              </div>
            </label>
            <textarea
              id="experience"
              required
              rows={4}
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Describe any relevant experience you have..."
            />
          </div>

          <div>
            <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Availability</span>
              </div>
            </label>
            <textarea
              id="availability"
              required
              rows={3}
              value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="What days/times are you available?"
            />
          </div>

          <div>
            <label htmlFor="motivation" className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Motivation</span>
              </div>
            </label>
            <textarea
              id="motivation"
              required
              rows={4}
              value={formData.motivation}
              onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Why do you want to volunteer for this service?"
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
                  Submit Application
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