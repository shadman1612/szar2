import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FileText, Clock, Tag, ListChecks, MapPin, Users, Calendar } from 'lucide-react';

const categories = [
  'language',
  'community',
  'health',
  'education',
  'professional'
];

const locationTypes = [
  'home',
  'community_center',
  'school',
  'college',
  'university',
  'park',
  'library',
  'other'
];

const recurrencePatterns = [
  'daily',
  'weekly',
  'biweekly',
  'monthly',
  'custom'
];

export function CreateService() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'community',
    requirements: '',
    volunteer_hours_reward: 1,
    min_participants: 1,
    max_participants: 10,
    min_volunteers: 1,
    max_volunteers: 5,
    start_date: '',
    end_date: '',
    is_recurring: false,
    recurrence_pattern: '',
    location_type: 'community_center',
    location_address: '',
    location_details: ''
  });

  // Check authentication status when component mounts
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth', { state: { returnTo: '/services/create' } });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      navigate('/auth');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: service, error: insertError } = await supabase
        .from('services')
        .insert({
          ...formData,
          created_by: user.id
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Send notification about new event
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const functionUrl = `${supabaseUrl}/functions/v1/event-notifications`;
      
      await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'EVENT_CREATED',
          event: service
        }),
      });

      navigate('/services');
    } catch (err: any) {
      console.error('Error creating service:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Create a New Service</h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Service Title</span>
              </div>
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., English Language Tutoring"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Describe the service you're offering..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span>Category</span>
                </div>
              </label>
              <select
                id="category"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="volunteer_hours_reward" className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Volunteer Hours Reward</span>
                </div>
              </label>
              <input
                type="number"
                id="volunteer_hours_reward"
                required
                min="0"
                value={formData.volunteer_hours_reward}
                onChange={(e) => setFormData({ ...formData, volunteer_hours_reward: parseInt(e.target.value) })}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Participants</span>
                </div>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="min_participants" className="block text-xs text-gray-500">
                    Minimum
                  </label>
                  <input
                    type="number"
                    id="min_participants"
                    required
                    min="1"
                    value={formData.min_participants}
                    onChange={(e) => setFormData({ ...formData, min_participants: parseInt(e.target.value) })}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="max_participants" className="block text-xs text-gray-500">
                    Maximum
                  </label>
                  <input
                    type="number"
                    id="max_participants"
                    required
                    min={formData.min_participants}
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Volunteers</span>
                </div>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="min_volunteers" className="block text-xs text-gray-500">
                    Minimum
                  </label>
                  <input
                    type="number"
                    id="min_volunteers"
                    required
                    min="1"
                    value={formData.min_volunteers}
                    onChange={(e) => setFormData({ ...formData, min_volunteers: parseInt(e.target.value) })}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="max_volunteers" className="block text-xs text-gray-500">
                    Maximum
                  </label>
                  <input
                    type="number"
                    id="max_volunteers"
                    required
                    min={formData.min_volunteers}
                    value={formData.max_volunteers}
                    onChange={(e) => setFormData({ ...formData, max_volunteers: parseInt(e.target.value) })}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Start Date & Time</span>
                </div>
              </label>
              <input
                type="datetime-local"
                id="start_date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>End Date & Time</span>
                </div>
              </label>
              <input
                type="datetime-local"
                id="end_date"
                required
                min={formData.start_date}
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_recurring"
                checked={formData.is_recurring}
                onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="is_recurring" className="ml-2 block text-sm text-gray-700">
                This is a recurring service
              </label>
            </div>

            {formData.is_recurring && (
              <div>
                <label htmlFor="recurrence_pattern" className="block text-sm font-medium text-gray-700 mb-1">
                  Recurrence Pattern
                </label>
                <select
                  id="recurrence_pattern"
                  required
                  value={formData.recurrence_pattern}
                  onChange={(e) => setFormData({ ...formData, recurrence_pattern: e.target.value })}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a pattern</option>
                  {recurrencePatterns.map((pattern) => (
                    <option key={pattern} value={pattern}>
                      {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="location_type" className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Location Type</span>
              </div>
            </label>
            <select
              id="location_type"
              required
              value={formData.location_type}
              onChange={(e) => setFormData({ ...formData, location_type: e.target.value })}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {locationTypes.map((type) => (
                <option key={type} value={type}>
                  {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="location_address" className="block text-sm font-medium text-gray-700 mb-1">
              Location Address
            </label>
            <input
              type="text"
              id="location_address"
              required
              value={formData.location_address}
              onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter the full address"
            />
          </div>

          <div>
            <label htmlFor="location_details" className="block text-sm font-medium text-gray-700 mb-1">
              Location Details
            </label>
            <textarea
              id="location_details"
              rows={2}
              value={formData.location_details}
              onChange={(e) => setFormData({ ...formData, location_details: e.target.value })}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Additional details about the location (e.g., Room number, parking instructions)"
            />
          </div>

          <div>
            <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4" />
                <span>Requirements</span>
              </div>
            </label>
            <textarea
              id="requirements"
              rows={3}
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="List any requirements for volunteers..."
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Service'}
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