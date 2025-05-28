
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Clock, Package, TrendingUp, Truck } from "lucide-react";

interface TaskLog {
  id: string;
  task_name: string;
  start_time: string;
  end_time: string;
  volume: number;
  created_at: string;
  user_id: string;
}

const Dashboard = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    taskName: '',
    startTime: '',
    endTime: '',
    volume: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkUserAndLoadData();
  }, []);

  const checkUserAndLoadData = async () => {
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
      await loadTaskLogs(user.id);
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/signin');
    } finally {
      setLoading(false);
    }
  };

  const loadTaskLogs = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('task_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching task logs:', error);
        toast({
          title: "Error",
          description: "Failed to load task logs",
          variant: "destructive"
        });
        return;
      }

      setTaskLogs(data || []);
    } catch (error) {
      console.error('Error loading task logs:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTaskNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      taskName: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.taskName || !formData.startTime || !formData.endTime || !formData.volume) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (!userProfile?.id) {
      toast({
        title: "Error", 
        description: "User not found",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('task_logs')
        .insert({
          task_name: formData.taskName,
          start_time: formData.startTime,
          end_time: formData.endTime,
          volume: parseInt(formData.volume),
          user_id: userProfile.id
        });

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

      setFormData({
        taskName: '',
        startTime: '',
        endTime: '',
        volume: ''
      });

      await loadTaskLogs(userProfile.id);
    } catch (error) {
      console.error('Error submitting task:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/signin');
  };

  const formatTime = (timeString: string) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMinutes}m`;
  };

  // Calculate totals
  const totalTasks = taskLogs.length;
  const totalVolume = taskLogs.reduce((sum, log) => sum + log.volume, 0);

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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-red-600 p-2 rounded-full">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DHL ATT Dashboard</h1>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Package className="h-5 w-5 text-green-600" />
                <span>Total Tasks</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalTasks}</div>
              <p className="text-sm text-gray-600">Tasks completed</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span>Total Volume</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{totalVolume}</div>
              <p className="text-sm text-gray-600">Items processed</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Entry Form */}
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-red-600" />
                <span>Log New Task</span>
              </CardTitle>
              <CardDescription>
                Record your daily task activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="taskName">Task Name</Label>
                  <Select onValueChange={handleTaskNameChange} value={formData.taskName}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a task" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sorting">Sorting</SelectItem>
                      <SelectItem value="Loading">Loading</SelectItem>
                      <SelectItem value="Unloading">Unloading</SelectItem>
                      <SelectItem value="Scanning">Scanning</SelectItem>
                      <SelectItem value="Delivery">Delivery</SelectItem>
                      <SelectItem value="Collection">Collection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      name="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="border-gray-200 focus:border-red-500 focus:ring-red-500"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      name="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="border-gray-200 focus:border-red-500 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="volume">Volume/Quantity</Label>
                  <Input
                    id="volume"
                    name="volume"
                    type="number"
                    placeholder="Enter quantity"
                    value={formData.volume}
                    onChange={handleInputChange}
                    className="border-gray-200 focus:border-red-500 focus:ring-red-500"
                    required
                    min="1"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium"
                >
                  Submit Task Log
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Task History */}
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle>Recent Tasks</CardTitle>
              <CardDescription>
                Your latest task activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {taskLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No tasks logged yet</p>
                  <p className="text-sm text-gray-500">Start by logging your first task</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {taskLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">{log.task_name}</h4>
                          <p className="text-sm text-gray-600">
                            {formatTime(log.start_time)} - {formatTime(log.end_time)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Duration: {calculateDuration(log.start_time, log.end_time)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">{log.volume}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(log.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Full Task Log Table */}
        {taskLogs.length > 0 && (
          <Card className="shadow-xl border-0 mt-6">
            <CardHeader>
              <CardTitle>All Task Logs</CardTitle>
              <CardDescription>
                Complete history of your task activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taskLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.task_name}</TableCell>
                        <TableCell>{formatTime(log.start_time)}</TableCell>
                        <TableCell>{formatTime(log.end_time)}</TableCell>
                        <TableCell>{calculateDuration(log.start_time, log.end_time)}</TableCell>
                        <TableCell>{log.volume}</TableCell>
                        <TableCell>
                          {new Date(log.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
