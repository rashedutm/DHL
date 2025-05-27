
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, User, Truck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// Mock team leaders data - in a real app, this would come from your database
const mockTeamLeaders = [
  { id: 1, name: "John Smith", email: "john.smith@dhl.com" },
  { id: 2, name: "Sarah Johnson", email: "sarah.johnson@dhl.com" },
  { id: 3, name: "Michael Brown", email: "michael.brown@dhl.com" },
  { id: 4, name: "Emily Davis", email: "emily.davis@dhl.com" },
  { id: 5, name: "David Wilson", email: "david.wilson@dhl.com" }
];

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    teamLeader: ''
  });
  const { toast } = useToast();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (formData.role === 'staff' && !formData.teamLeader) {
      toast({
        title: "Error",
        description: "Staff members must select a team leader",
        variant: "destructive"
      });
      return;
    }

    // Mock sign up logic
    toast({
      title: "Success",
      description: "Account created successfully!",
    });
    console.log('Sign up data:', formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-yellow-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-red-600 p-3 rounded-full">
              <Truck className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">DHL ATT System</CardTitle>
          <CardDescription className="text-gray-600">Create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
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
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
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
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
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
              <Label className="text-sm font-medium text-gray-700">Select Role</Label>
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
                <Label className="text-sm font-medium text-gray-700">Choose Team Leader</Label>
                <Select onValueChange={handleTeamLeaderChange} value={formData.teamLeader}>
                  <SelectTrigger className="h-12 border-gray-200 focus:border-red-500 focus:ring-red-500">
                    <SelectValue placeholder="Select your team leader" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    {mockTeamLeaders.map((leader) => (
                      <SelectItem key={leader.id} value={leader.id.toString()}>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-red-600" />
                          <span>{leader.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
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
