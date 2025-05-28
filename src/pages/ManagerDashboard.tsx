
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Users, Clock, Package, TrendingUp, Crown, UserCheck } from "lucide-react";

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
    role: string;
  };
}

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  team_leader_id: string | null;
}

const ManagerDashboard = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);
  const [teamLeaders, setTeamLeaders] = useState<Employee[]>([]);
  const [staffMembers, setStaffMembers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
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

      if (profile.role !== 'manager') {
        toast({
          title: "Access Denied",
          description: "This dashboard is only available for managers",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      setUserProfile(profile);
      await loadManagerData(profile.id);
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/signin');
    } finally {
      setLoading(false);
    }
  };

  const loadManagerData = async (managerId: string) => {
    try {
      console.log('Loading manager data for manager:', managerId);
      
      // Load all employees under this manager (team leaders and staff)
      const { data: employees, error: employeesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('manager_id', managerId)
        .in('role', ['team_leader', 'staff']);

      if (employeesError) {
        console.error('Error fetching employees:', employeesError);
        setTeamLeaders([]);
        setStaffMembers([]);
      } else {
        console.log('Employees found:', employees);
        const leaders = employees?.filter(emp => emp.role === 'team_leader') || [];
        const staff = employees?.filter(emp => emp.role === 'staff') || [];
        setTeamLeaders(leaders);
        setStaffMembers(staff);
      }

      // Get all employee IDs for task log filtering
      const employeeIds = employees?.map(emp => emp.id) || [];
      console.log('Employee IDs:', employeeIds);

      if (employeeIds.length === 0) {
        console.log('No employees found, skipping task log fetch');
        setTaskLogs([]);
        return;
      }

      // Load task logs from all employees (both team leaders and staff)
      const { data: logs, error: logsError } = await supabase
        .from('task_logs')
        .select('*')
        .in('user_id', employeeIds)
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
        const logsWithProfiles = (logs || []).map((log) => {
          const employee = employees?.find(emp => emp.id === log.user_id);
          return {
            ...log,
            profiles: employee ? {
              name: employee.name,
              email: employee.email,
              role: employee.role
            } : {
              name: 'Unknown',
              email: 'Unknown',
              role: 'Unknown'
            }
          };
        });
        
        setTaskLogs(logsWithProfiles);
      }
    } catch (error) {
      console.error('Error loading manager data:', error);
      toast({
        title: "Error",
        description: "Failed to load manager data",
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
  const totalEmployees = teamLeaders.length + staffMembers.length;

  // Calculate staff-specific stats
  const staffTaskLogs = taskLogs.filter(log => log.profiles?.role === 'staff');
  const teamLeaderTaskLogs = taskLogs.filter(log => log.profiles?.role === 'team_leader');

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
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
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

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Total Employees</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalEmployees}</div>
              <p className="text-sm text-gray-600">{teamLeaders.length} Team Leaders, {staffMembers.length} Staff</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <UserCheck className="h-5 w-5 text-green-600" />
                <span>Team Leaders</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{teamLeaders.length}</div>
              <p className="text-sm text-gray-600">{teamLeaderTaskLogs.length} tasks completed</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Package className="h-5 w-5 text-purple-600" />
                <span>Total Tasks</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{totalTasks}</div>
              <p className="text-sm text-gray-600">All employees combined</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <span>Total Volume</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{totalVolume}</div>
              <p className="text-sm text-gray-600">Items processed</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team-leaders">Team Leaders</TabsTrigger>
            <TabsTrigger value="staff">Staff Members</TabsTrigger>
            <TabsTrigger value="task-logs">All Task Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserCheck className="h-5 w-5 text-green-600" />
                    <span>Team Leaders Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {teamLeaders.length === 0 ? (
                    <p className="text-gray-600">No team leaders assigned</p>
                  ) : (
                    <div className="space-y-3">
                      {teamLeaders.map((leader) => (
                        <div key={leader.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-semibold">{leader.name}</div>
                            <div className="text-sm text-gray-500">{leader.email}</div>
                          </div>
                          <div className="text-sm text-gray-600">
                            {teamLeaderTaskLogs.filter(log => log.user_id === leader.id).length} tasks
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span>Staff Members Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {staffMembers.length === 0 ? (
                    <p className="text-gray-600">No staff members assigned</p>
                  ) : (
                    <div className="space-y-3">
                      {staffMembers.map((staff) => (
                        <div key={staff.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-semibold">{staff.name}</div>
                            <div className="text-sm text-gray-500">{staff.email}</div>
                          </div>
                          <div className="text-sm text-gray-600">
                            {staffTaskLogs.filter(log => log.user_id === staff.id).length} tasks
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="team-leaders">
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  <span>Team Leaders</span>
                </CardTitle>
                <CardDescription>
                  Team leaders under your management ({teamLeaders.length} total)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {teamLeaders.length === 0 ? (
                  <div className="text-center py-8">
                    <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No team leaders assigned to you yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Tasks Completed</TableHead>
                          <TableHead>Total Volume</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teamLeaders.map((leader) => {
                          const leaderTasks = teamLeaderTaskLogs.filter(log => log.user_id === leader.id);
                          const leaderVolume = leaderTasks.reduce((sum, log) => sum + log.volume, 0);
                          return (
                            <TableRow key={leader.id}>
                              <TableCell className="font-medium">{leader.name}</TableCell>
                              <TableCell>{leader.email}</TableCell>
                              <TableCell>{leaderTasks.length}</TableCell>
                              <TableCell>{leaderVolume}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff">
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span>Staff Members</span>
                </CardTitle>
                <CardDescription>
                  Staff members under your management ({staffMembers.length} total)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {staffMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No staff members assigned to you yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Team Leader</TableHead>
                          <TableHead>Tasks Completed</TableHead>
                          <TableHead>Total Volume</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {staffMembers.map((staff) => {
                          const staffTasks = staffTaskLogs.filter(log => log.user_id === staff.id);
                          const staffVolume = staffTasks.reduce((sum, log) => sum + log.volume, 0);
                          const teamLeader = teamLeaders.find(leader => leader.id === staff.team_leader_id);
                          return (
                            <TableRow key={staff.id}>
                              <TableCell className="font-medium">{staff.name}</TableCell>
                              <TableCell>{staff.email}</TableCell>
                              <TableCell>{teamLeader?.name || 'Not assigned'}</TableCell>
                              <TableCell>{staffTasks.length}</TableCell>
                              <TableCell>{staffVolume}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="task-logs">
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-red-600" />
                  <span>All Task Logs</span>
                </CardTitle>
                <CardDescription>
                  Recent task activities from all employees ({taskLogs.length} tasks found)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {taskLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No task logs found</p>
                    <p className="text-sm text-gray-500">
                      {totalEmployees === 0 
                        ? "No employees assigned to you yet" 
                        : "Your employees haven't logged any tasks yet"}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Role</TableHead>
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
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                log.profiles?.role === 'team_leader' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {log.profiles?.role === 'team_leader' ? 'Team Leader' : 'Staff'}
                              </span>
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ManagerDashboard;
