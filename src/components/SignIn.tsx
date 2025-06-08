
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// DHL Logo Component
const DHLLogo = ({ className = "h-8 w-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <defs>
      <style>
        {`.dhl-bg { fill: #ffcc00; }
         .dhl-text { fill: #dd0000; font-family: Arial, sans-serif; font-weight: bold; font-size: 28px; }`}
      </style>
    </defs>
    <circle cx="50" cy="50" r="50" className="dhl-bg"/>
    <text x="50" y="60" textAnchor="middle" className="dhl-text">DHL</text>
  </svg>
);

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Get user profile to determine role and redirect accordingly
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast({
          title: "Warning",
          description: "Sign in successful, but could not determine user role",
        });
        navigate('/');
        return;
      }

      toast({
        title: "Success",
        description: "Sign in successful!",
      });

      // Redirect based on role
      if (profile.role === 'staff') {
        navigate('/dashboard');
      } else if (profile.role === 'team_leader') {
        navigate('/team-leader-dashboard');
      } else if (profile.role === 'manager') {
        navigate('/manager-dashboard');
      } else {
        navigate('/');
      }

    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-200 via-yellow-300 to-amber-200 p-4">
      <Card className="w-full max-w-md shadow-2xl border-2 border-red-600 bg-white">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-4">
            <DHLLogo className="h-16 w-16" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">DHL ATT System</CardTitle>
          <CardDescription className="text-red-700">Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-red-700">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10 h-12 border-gray-200 focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-red-700">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 h-12 border-gray-200 focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-red-700">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="font-medium text-red-600 hover:text-red-500 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;
