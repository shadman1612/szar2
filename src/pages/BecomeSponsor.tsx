import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Calendar, Building2, Gift, CreditCard, Users, FileText } from "lucide-react";

const sponsorshipTypes = [
  { value: "event", label: "Single Event Sponsorship" },
  { value: "campaign", label: "Campaign Sponsorship" },
  { value: "annual", label: "Annual Partnership" },
  { value: "in_kind", label: "In-Kind Sponsorship" }
];

const BecomeSponsor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    organization_name: "",
    contact_name: "",
    email: "",
    phone: "",
    sponsorship_type: "event",
    description: "",
    contribution_amount: "",
    start_date: "",
    duration: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await supabase
        .from('sponsorship_applications')
        .insert([{
          ...formData,
          status: 'pending',
        }]);

      if (submitError) throw submitError;

      // Show success message and redirect
      navigate('/thank-you-sponsor');
    } catch (err: any) {
      console.error('Error submitting sponsorship application:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Become a Sponsor</h1>
          <p className="text-gray-600">
            Join us in making a difference in our community. Your sponsorship helps us create meaningful impact
            and supports our mission of community service.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="organization_name" className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>Organization Name</span>
                </div>
              </label>
              <input
                type="text"
                id="organization_name"
                required
                value={formData.organization_name}
                onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="contact_name" className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Contact Person</span>
                </div>
              </label>
              <input
                type="text"
                id="contact_name"
                required
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="sponsorship_type" className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4" />
                <span>Sponsorship Type</span>
              </div>
            </label>
            <select
              id="sponsorship_type"
              required
              value={formData.sponsorship_type}
              onChange={(e) => setFormData({ ...formData, sponsorship_type: e.target.value })}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {sponsorshipTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Sponsorship Details</span>
              </div>
            </label>
            <textarea
              id="description"
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Please describe your sponsorship interests and any specific requirements..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="contribution_amount" className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Contribution Amount/Details</span>
                </div>
              </label>
              <input
                type="text"
                id="contribution_amount"
                required
                value={formData.contribution_amount}
                onChange={(e) => setFormData({ ...formData, contribution_amount: e.target.value })}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter amount or describe in-kind contribution"
              />
            </div>

            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Preferred Start Date</span>
                </div>
              </label>
              <input
                type="date"
                id="start_date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duration/Commitment Period
            </label>
            <input
              type="text"
              id="duration"
              required
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., One-time, 6 months, 1 year"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Sponsorship Application'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BecomeSponsor;