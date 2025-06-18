import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Navigation() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="w-8 h-8 text-red-500" />
            <span className="text-xl font-bold text-gray-900">Szar</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link to="/services" className="text-gray-600 hover:text-gray-900">
              Services
            </Link>
            {user ? (
              <Link to="/profile" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
                <User className="w-5 h-5" />
                <span>Profile</span>
              </Link>
            ) : (
              <Link
                to="/auth"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}