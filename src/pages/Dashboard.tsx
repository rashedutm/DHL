
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Clock, Package, User } from "lucide-react";

const taskTypes = [
  'Sorting',
  'Labeling', 
  'Packing',
  'Scanning',
  'Loading',
  'Unloading',
  'Inventory Counting',
  'Picking',
  'Returns Processing',
  'Documentation',
  'Quality Check',
  'Staging',
  'Repacking',
  'Pallet Wrapping',
  'Item Verification',
  'Shifting Inventory',
  'Kitting'
];

const Dashboard = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    taskName: '',
    startTime: '',
    endTime: '',
    volume: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkUserAndRedirect();
  }, []);

  const checkUserAndRedirect = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/signin');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive"
        });
        return;
      }

      if (profile.role !== 'staff') {
        toast({
          title: "Access Denied",
          description: "This dashboard is only available for staff members",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      setUserProfile(profile);
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/signin');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTaskNameChange = (value) => {
    setFormData(prev => ({
      ...prev,
      taskName: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Validation
    if (!formData.taskName || !formData.startTime || !formData.endTime || !formData.volume) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      setSubmitting(false);
      return;
    }

    // Validate time stamps
    const startTime = new Date(`2000-01-01T${formData.startTime}:00`);
    const endTime = new Date(`2000-01-01T${formData.endTime}:00`);
    
    if (endTime <= startTime) {
      toast({
        title: "Error",
        description: "End time must be after start time",
        variant: "destructive"
      });
      setSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('task_logs')
        .insert([
          {
            user_id: userProfile.id,
            task_name: formData.taskName,
            start_time: formData.startTime,
            end_time: formData.endTime,
            volume: parseInt(formData.volume)
          }
        ]);

      if (error) {
        console.error('Error submitting task:', error);
        toast({
          title: "Error",
          description: "Failed to submit task log",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Task log submitted successfully!",
      });

      // Reset form
      setFormData({
        taskName: '',
        startTime: '',
        endTime: '',
        volume: ''
      });

    } catch (error) {
      console.error('Error submitting task:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/signin');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-yellow-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-red-600 p-2 rounded-full">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
              <p className="text-gray-600">Welcome, {userProfile?.name}</p>
            </div>
          </div>
          <Button 
            onClick={handleSignOut}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            Sign Out
          </Button>
        </div>

        {/* Task Log Form */}
        <Card className="shadow-xl border-0">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-red-600" />
              <span>Log Your Task</span>
            </CardTitle>
            <CardDescription>
              Record your daily warehouse activities and time spent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Task Name</Label>
                <Select onValueChange={handleTaskNameChange} value={formData.taskName}>
                  <SelectTrigger className="h-12 border-gray-200 focus:border-red-500 focus:ring-red-500">
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg max-h-60">
                    {taskTypes.map((task) => (
                      <SelectItem key={task} value={task}>
                        {task}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Start Time</span>
                  </Label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="h-12 border-gray-200 focus:border-red-500 focus:ring-red-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>End Time</span>
                  </Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="h-12 border-gray-200 focus:border-red-500 focus:ring-red-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="volume" className="text-sm font-medium text-gray-700">
                  Volume (Quantity Processed)
                </Label>
                <Input
                  id="volume"
                  name="volume"
                  type="number"
                  placeholder="e.g., 50 parcels, 200 labels"
                  value={formData.volume}
                  onChange={handleInputChange}
                  className="h-12 border-gray-200 focus:border-red-500 focus:ring-red-500"
                  min="1"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Task Log"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
