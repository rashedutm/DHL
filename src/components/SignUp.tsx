import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, User, Users } from "lucide-react";
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

interface TeamLeader {
  id: string;
  name: string;
  email: string;
}

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    teamLeader: ''
  });
  const [teamLeaders, setTeamLeaders] = useState<TeamLeader[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch team leaders when component mounts
  useEffect(() => {
    fetchTeamLeaders();
  }, []);

  const fetchTeamLeaders = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('role', 'team_leader');

      if (error) {
        console.error('Error fetching team leaders:', error);
        return;
      }

      setTeamLeaders(data || []);
    } catch (error) {
      console.error('Error fetching team leaders:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value,
      teamLeader: '' // Reset team leader when role changes
    }));
  };

  const handleTeamLeaderChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      teamLeader: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    if (formData.role === 'staff' && !formData.teamLeader) {
      toast({
        title: "Error",
        description: "Staff members must select a team leader",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    try {
      // Sign up the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: formData.role,
            team_leader_id: formData.role === 'staff' ? formData.teamLeader : null,
          }
        }
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

      toast({
        title: "Success",
        description: "Account created successfully! Please check your email to verify your account.",
      });

      // Insert into profiles table
      if (data?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              name: formData.name,
              email: formData.email,
              role: formData.role,
              team_leader_id: formData.role === 'staff' ? formData.teamLeader : null
            }
          ]);
        if (profileError) {
          toast({
            title: "Profile Error",
            description: profileError.message,
            variant: "destructive"
          });
        }
      }

      // Redirect to sign in page
      navigate('/signin');

    } catch (error) {
      console.error('Sign up error:', error);
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
          <CardDescription className="text-red-700">Create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-red-700">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="pl-10 h-12 border-gray-200 focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>
            </div>

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

            <div className="space-y-2">
              <Label className="text-sm font-medium text-red-700">Select Role</Label>
              <Select onValueChange={handleRoleChange} value={formData.role}>
                <SelectTrigger className="h-12 border-gray-200 focus:border-red-500 focus:ring-red-500">
                  <SelectValue placeholder="Choose your role" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="team_leader">Team Leader</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role === 'staff' && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <Label className="text-sm font-medium text-red-700">Choose Team Leader</Label>
                {teamLeaders.length > 0 ? (
                  <Select onValueChange={handleTeamLeaderChange} value={formData.teamLeader}>
                    <SelectTrigger className="h-12 border-gray-200 focus:border-red-500 focus:ring-red-500">
                      <SelectValue placeholder="Select your team leader" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      {teamLeaders.map((leader) => (
                        <SelectItem key={leader.id} value={leader.id}>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-red-600" />
                            <span>{leader.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="h-12 border border-gray-200 rounded-md flex items-center px-3 bg-gray-50">
                    <span className="text-gray-500 text-sm">No team leaders available</span>
                  </div>
                )}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-red-700">
              Already have an account?{' '}
              <Link 
                to="/signin" 
                className="font-medium text-red-600 hover:text-red-500 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;
