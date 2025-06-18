import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Award, Clock, LogOut, Calendar, Edit2, Trash2, Users } from 'lucide-react';
import { format } from 'date-fns';

type Profile = {
  id: string;
  full_name: string | null;
  bio: string | null;
  skills: string[] | null;
  volunteer_hours: number;
  is_volunteer: boolean;
};

type Service = {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location_type: string;
  location_address: string;
};

type ServiceRequest = {
  id: string;
  service: Service;
  status: string;
  created_at: string;
};

type VolunteerApplication = {
  id: string;
  service: Service;
  status: string;
  created_at: string;
};

type ParticipantRegistration = {
  id: string;
  service: Service;
  status: string;
  created_at: string;
};

export function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [createdServices, setCreatedServices] = useState<Service[]>([]);
  const [volunteerApplications, setVolunteerApplications] = useState<VolunteerApplication[]>([]);
  const [participantRegistrations, setParticipantRegistrations] = useState<ParticipantRegistration[]>([]);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    skills: '',
    is_volunteer: false,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
    fetchUserEvents();
  }, []);

  async function fetchProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      let { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!existingProfile) {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: null,
            bio: null,
            skills: [],
            volunteer_hours: 0,
            is_volunteer: false
          })
          .select()
          .single();

        if (insertError) throw insertError;
        existingProfile = newProfile;
      }

      setProfile(existingProfile);
      setFormData({
        full_name: existingProfile.full_name || '',
        bio: existingProfile.bio || '',
        skills: existingProfile.skills?.join(', ') || '',
        is_volunteer: existingProfile.is_volunteer || false,
      });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserEvents() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch services created by the user
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('created_by', user.id);

      if (servicesError) throw servicesError;
      setCreatedServices(services || []);

      // Fetch volunteer applications
      const { data: applications, error: applicationsError } = await supabase
        .from('volunteer_applications')
        .select(`
          id,
          status,
          created_at,
          service:services (*)
        `)
        .eq('volunteer_id', user.id);

      if (applicationsError) throw applicationsError;
      setVolunteerApplications(applications || []);

      // Fetch participant registrations
      const { data: registrations, error: registrationsError } = await supabase
        .from('participant_registrations')
        .select(`
          id,
          status,
          created_at,
          service:services (*)
        `)
        .eq('participant_id', user.id);

      if (registrationsError) throw registrationsError;
      setParticipantRegistrations(registrations || []);
    } catch (error) {
      console.error('Error fetching user events:', error);
    }
  }

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const updates = {
        full_name: formData.full_name,
        bio: formData.bio,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(Boolean),
        is_volunteer: formData.is_volunteer,
        updated_at: new Date().toISOString(),
      };

      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setProfile(updatedProfile);
      setEditing(false);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  async function handleDeleteService(serviceId: string) {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
      fetchUserEvents();
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <button
            onClick={handleSignOut}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {!editing ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 rounded-full p-3">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{profile?.full_name || 'Anonymous'}</h2>
                <p className="text-gray-600">{profile?.is_volunteer ? 'Volunteer' : 'Community Member'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-5 h-5" />
              <span>{profile?.volunteer_hours || 0} Volunteer Hours</span>
            </div>

            {profile?.bio && (
              <div>
                <h3 className="text-lg font-semibold mb-2">About</h3>
                <p className="text-gray-600">{profile.bio}</p>
              </div>
            )}

            {profile?.skills && profile.skills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={updateProfile} className="space-y-6">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                id="skills"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_volunteer"
                checked={formData.is_volunteer}
                onChange={(e) => setFormData({ ...formData, is_volunteer: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="is_volunteer" className="ml-2 block text-sm text-gray-700">
                I want to volunteer
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* My Events Section */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Events</h2>

        {/* Created Services */}
        {createdServices.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Services I Created</h3>
            <div className="space-y-4">
              {createdServices.map(service => (
                <div key={service.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{service.title}</h4>
                      <p className="text-sm text-gray-600">{service.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(service.start_date), 'PPP')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/services/${service.id}/edit`)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Volunteer Applications */}
        {volunteerApplications.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">My Volunteer Applications</h3>
            <div className="space-y-4">
              {volunteerApplications.map(application => (
                <div key={application.id} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold">{application.service.title}</h4>
                  <p className="text-sm text-gray-600">{application.service.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(application.service.start_date), 'PPP')}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      application.status === 'approved' ? 'bg-green-100 text-green-800' :
                      application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Participant Registrations */}
        {participantRegistrations.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">My Registrations</h3>
            <div className="space-y-4">
              {participantRegistrations.map(registration => (
                <div key={registration.id} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold">{registration.service.title}</h4>
                  <p className="text-sm text-gray-600">{registration.service.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(registration.service.start_date), 'PPP')}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      registration.status === 'approved' ? 'bg-green-100 text-green-800' :
                      registration.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {createdServices.length === 0 && 
         volunteerApplications.length === 0 && 
         participantRegistrations.length === 0 && (
          <div className="text-center text-gray-600 py-8">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>You haven't participated in any events yet.</p>
            <Link
              to="/services"
              className="text-blue-600 hover:text-blue-800 font-medium inline-block mt-2"
            >
              Browse Available Services
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}