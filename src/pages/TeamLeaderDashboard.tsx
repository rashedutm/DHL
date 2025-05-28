
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Users, Clock, Package, TrendingUp } from "lucide-react";

interface TaskLog {
  id: string;
  task_name: string;
  start_time: string;
  end_time: string;
  volume: number;
  created_at: string;
  user_id: string;
  profiles?: {
    name: string;
    email: string;
  };
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

const TeamLeaderDashboard = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
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

      if (profile.role !== 'team_leader') {
        toast({
          title: "Access Denied",
          description: "This dashboard is only available for team leaders",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      setUserProfile(profile);
      await loadTeamData(profile.id);
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/signin');
    } finally {
      setLoading(false);
    }
  };

  const loadTeamData = async (teamLeaderId: string) => {
    try {
      console.log('Loading team data for team leader:', teamLeaderId);
      
      // Load team members
      const { data: members, error: membersError } = await supabase
        .from('profiles')
        .select('*')
        .eq('team_leader_id', teamLeaderId)
        .eq('role', 'staff');

      if (membersError) {
        console.error('Error fetching team members:', membersError);
      } else {
        console.log('Team members found:', members);
        setTeamMembers(members || []);
      }

      // Get team member IDs for task log filtering
      const teamMemberIds = members?.map(member => member.id) || [];
      console.log('Team member IDs:', teamMemberIds);

      if (teamMemberIds.length === 0) {
        console.log('No team members found, skipping task log fetch');
        setTaskLogs([]);
        return;
      }

      // Load task logs from team members using a simpler approach
      const { data: logs, error: logsError } = await supabase
        .from('task_logs')
        .select('*')
        .in('user_id', teamMemberIds)
        .order('created_at', { ascending: false });

      if (logsError) {
        console.error('Error fetching task logs:', logsError);
        toast({
          title: "Error",
          description: "Failed to load task logs",
          variant: "destructive"
        });
        setTaskLogs([]);
      } else {
        console.log('Task logs found:', logs);
        
        // Manually join with profile data
        const logsWithProfiles = await Promise.all(
          (logs || []).map(async (log) => {
            const member = members?.find(m => m.id === log.user_id);
            return {
              ...log,
              profiles: member ? {
                name: member.name,
                email: member.email
              } : {
                name: 'Unknown',
                email: 'Unknown'
              }
            };
          })
        );
        
        setTaskLogs(logsWithProfiles);
      }
    } catch (error) {
      console.error('Error loading team data:', error);
      toast({
        title: "Error",
        description: "Failed to load team data",
        variant: "destructive"
      });
    }
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/signin');
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-red-600 p-2 rounded-full">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Team Leader Dashboard</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Team Members</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{teamMembers.length}</div>
              <p className="text-sm text-gray-600">Active staff members</p>
            </CardContent>
          </Card>

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

        {/* Task Logs Table */}
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-red-600" />
              <span>Team Task Logs</span>
            </CardTitle>
            <CardDescription>
              Recent task activities from your team members ({taskLogs.length} tasks found)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {taskLogs.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No task logs found</p>
                <p className="text-sm text-gray-500">
                  {teamMembers.length === 0 
                    ? "No team members assigned to you yet" 
                    : "Your team members haven't logged any tasks yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
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
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{log.profiles?.name || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">{log.profiles?.email || 'Unknown'}</div>
                          </div>
                        </TableCell>
                        <TableCell>{log.task_name}</TableCell>
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamLeaderDashboard;
