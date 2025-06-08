import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Users, Clock, Package, TrendingUp, Crown, UserCheck, ChevronDown, ChevronUp, Search, Bell, CheckCircle, AlertCircle, Info } from "lucide-react";
import { malaysianNames, generateDummyTaskLogs, dummyManagerProfile } from "@/lib/dummyData";
import { cn } from "@/lib/utils";

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
  team_leader_id?: string | null;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  read: boolean;
}

const ManagerDashboard = () => {
  const [userProfile, setUserProfile] = useState<any>(dummyManagerProfile);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);
  const [teamLeaders, setTeamLeaders] = useState<Employee[]>(malaysianNames.teamLeaders);
  const [staffMembers, setStaffMembers] = useState<Employee[]>(malaysianNames.staffMembers);
  const [loading, setLoading] = useState(true);
  const [highlightedTeam, setHighlightedTeam] = useState<string | null>(null);
  const [teamLeaderSearch, setTeamLeaderSearch] = useState('');
  const [staffSearch, setStaffSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'High Performance Alert',
      message: 'Team Ahmad bin Abdullah exceeded monthly target by 25%',
      type: 'success',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      read: false
    },
    {
      id: '2',
      title: 'Staff Attendance Issue',
      message: 'Mohammad bin Hassan has been absent for 2 consecutive days',
      type: 'warning',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      read: false
    },
    {
      id: '3',
      title: 'New Task Assignment',
      message: 'Special cargo handling training scheduled for Team Leaders',
      type: 'info',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      read: true
    },
    {
      id: '4',
      title: 'System Update',
      message: 'DHL tracking system will be updated tonight at 11 PM',
      type: 'info',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
      read: true
    },
    {
      id: '5',
      title: 'Low Productivity Alert',
      message: 'Team Fatimah binti Hassan productivity down by 15% this week',
      type: 'warning',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      read: false
    }
  ]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading delay
    setTimeout(() => {
      const logs = generateDummyTaskLogs();
      setTaskLogs(logs);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // Close notifications when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showNotifications && !target.closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

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

  const handleSignOut = () => {
    navigate('/signin');
  };

  const formatNotificationTime = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now.getTime() - notificationTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${Math.max(1, diffMinutes)} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  // Calculate totals
  const totalTasks = taskLogs.length;
  const currentMonthVolume = 2847; // Static dummy value for current month volume
  const totalEmployees = teamLeaders.length + staffMembers.length;

  // Calculate staff-specific stats
  const staffTaskLogs = taskLogs.filter(log => log.profiles?.role === 'staff');
  const teamLeaderTaskLogs = taskLogs.filter(log => log.profiles?.role === 'team_leader');

  const handleTopTeamClick = (teamId: string) => {
    setHighlightedTeam(teamId);
    const element = document.getElementById(`team-${teamId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Remove highlight after animation
      setTimeout(() => {
        setHighlightedTeam(null);
      }, 3000); // 3 seconds for 3 blinks
    }
  };

  // Filter task logs by selected month and year
  const getFilteredTaskLogs = () => {
    return taskLogs.filter(log => {
      const logDate = new Date(log.created_at);
      const logMonth = logDate.getMonth();
      const logYear = logDate.getFullYear();
      
      // Check month filter
      const monthMatch = selectedMonth === 'all' || logMonth === parseInt(selectedMonth);
      
      // Check year filter
      const yearMatch = selectedYear === 'all' || logYear === parseInt(selectedYear);
      
      return monthMatch && yearMatch;
    });
  };

  // Get available years from task logs
  const getAvailableYears = () => {
    const years = new Set<number>();
    taskLogs.forEach(log => {
      const logDate = new Date(log.created_at);
      const logYear = logDate.getFullYear();
      years.add(logYear);
    });
    
    return Array.from(years).sort((a, b) => b - a).map(year => ({
      value: year.toString(),
      label: year.toString()
    }));
  };

  // Get available months from task logs
  const getAvailableMonths = () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Return all 12 months
    return monthNames.map((monthName, index) => ({
      value: index.toString(),
      label: monthName
    }));
  };

  const filteredTaskLogs = getFilteredTaskLogs();
  const availableMonths = getAvailableMonths();
  const availableYears = getAvailableYears();

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
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowNotifications(!showNotifications)}
                className="border-gray-200 hover:bg-gray-50 relative"
              >
                <Bell className="h-5 w-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotificationsCount}
                  </span>
                )}
              </Button>
              
              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="notification-dropdown absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    <p className="text-sm text-gray-500">{unreadNotificationsCount} unread</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors",
                          !notification.read && "bg-blue-50"
                        )}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={cn(
                                "text-sm font-medium",
                                !notification.read ? "text-gray-900" : "text-gray-600"
                              )}>
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {formatNotificationTime(notification.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div className="p-4 text-center text-gray-500">
                        <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p>No notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              Sign Out
            </Button>
          </div>
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
              <p className="text-sm text-gray-600">{teamLeaderTaskLogs.reduce((sum, log) => sum + log.volume, 0)} volume approved</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Package className="h-5 w-5 text-purple-600" />
                <span>Active Operations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{teamLeaders.filter(leader => {
                const teamStaff = staffMembers.filter(staff => staff.team_leader_id === leader.id);
                const teamTasks = staffTaskLogs.filter(log => 
                  teamStaff.some(staff => staff.id === log.user_id)
                );
                return teamTasks.length > 0;
              }).length}</div>
              <p className="text-sm text-gray-600">Teams currently active</p>
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
              <div className="text-2xl font-bold text-orange-600">{currentMonthVolume}</div>
              <p className="text-sm text-gray-600">Current month items</p>
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
                    <span>Team Performance Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Top Performing Teams */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-700">Top Performing Teams</h3>
                      <div className="space-y-3">
                        {teamLeaders
                          .map(leader => {
                            const leaderTasks = teamLeaderTaskLogs.filter(log => log.user_id === leader.id);
                            const teamStaff = staffMembers.filter(staff => staff.team_leader_id === leader.id);
                            const teamTasks = staffTaskLogs.filter(log => 
                              teamStaff.some(staff => staff.id === log.user_id)
                            );
                            const teamVolume = teamTasks.reduce((sum, log) => sum + log.volume, 0);
                            const avgTaskPerStaff = teamStaff.length > 0 
                              ? (teamTasks.length / teamStaff.length).toFixed(1) 
                              : '0';
                            return {
                              ...leader,
                              teamSize: teamStaff.length,
                              teamTasks: teamTasks.length,
                              teamVolume,
                              avgTaskPerStaff
                            };
                          })
                          .sort((a, b) => b.teamVolume - a.teamVolume)
                          .slice(0, 3)
                          .map((team, index) => (
                            <div 
                              key={team.id} 
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                              onClick={() => handleTopTeamClick(team.id)}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                  <span className="text-green-600 font-semibold">{index + 1}</span>
                                </div>
                                <div>
                                  <div className="font-semibold">{team.name}</div>
                                  <div className="text-sm text-gray-500">{team.teamSize} staff, {team.teamTasks} tasks</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-green-600">{team.teamVolume}</div>
                                <div className="text-xs text-gray-500">items processed</div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Team Details */}
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-700 mb-3">All Teams</h3>
                      <div className="space-y-4">
                        {teamLeaders.map((leader) => {
                          const leaderTasks = teamLeaderTaskLogs.filter(log => log.user_id === leader.id);
                          const leaderVolume = leaderTasks.reduce((sum, log) => sum + log.volume, 0);
                          const teamStaff = staffMembers.filter(staff => staff.team_leader_id === leader.id);
                          const teamTasks = staffTaskLogs.filter(log => 
                            teamStaff.some(staff => staff.id === log.user_id)
                          );
                          const teamVolume = teamTasks.reduce((sum, log) => sum + log.volume, 0);
                          const avgTaskPerStaff = teamStaff.length > 0 
                            ? (teamTasks.length / teamStaff.length).toFixed(1) 
                            : '0';
                          
                          return (
                            <div 
                              key={leader.id} 
                              id={`team-${leader.id}`}
                              className={cn(
                                "p-4 bg-gray-50 rounded-lg space-y-3 transition-all duration-300",
                                highlightedTeam === leader.id && "animate-highlight"
                              )}
                            >
                              <div className={cn(
                                "flex justify-between items-start",
                                highlightedTeam === leader.id && "animate-pulse"
                              )}>
                                <div>
                                  <div className="font-semibold text-lg">{leader.name}</div>
                                  <div className="text-sm text-gray-500">{leader.email}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium text-green-600">Team Leader</div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                <div className="bg-white p-2 rounded">
                                  <div className="text-gray-500">Team Size</div>
                                  <div className="font-semibold">{teamStaff.length} staff</div>
                                </div>
                                <div className="bg-white p-2 rounded">
                                  <div className="text-gray-500">Team Tasks</div>
                                  <div className="font-semibold">{teamTasks.length}</div>
                                </div>
                                <div className="bg-white p-2 rounded">
                                  <div className="text-gray-500">Avg/Staff</div>
                                  <div className="font-semibold">{avgTaskPerStaff}</div>
                                </div>
                              </div>
                              
                              <div className="pt-2 border-t border-gray-200">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">Team Volume:</span>
                                  <span className="font-semibold">{teamVolume} items processed</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span>Staff Performance Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Overall Staff Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-500">Average Tasks/Staff</div>
                        <div className="text-xl font-semibold">
                          {(staffTaskLogs.length / staffMembers.length).toFixed(1)}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-500">Average Volume/Staff</div>
                        <div className="text-xl font-semibold">
                          {(staffTaskLogs.reduce((sum, log) => sum + log.volume, 0) / staffMembers.length).toFixed(1)}
                        </div>
                      </div>
                    </div>

                    {/* Top Performers */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-700">Top Performing Staff</h3>
                      <div className="space-y-3">
                        {staffMembers
                          .map(staff => {
                            const staffTasks = staffTaskLogs.filter(log => log.user_id === staff.id);
                            const staffVolume = staffTasks.reduce((sum, log) => sum + log.volume, 0);
                            return {
                              ...staff,
                              taskCount: staffTasks.length,
                              volume: staffVolume,
                              efficiency: staffTasks.length > 0 ? staffVolume / staffTasks.length : 0
                            };
                          })
                          .sort((a, b) => b.efficiency - a.efficiency)
                          .slice(0, 3)
                          .map((staff, index) => (
                            <div key={staff.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-blue-600 font-semibold">{index + 1}</span>
                                </div>
                                <div>
                                  <div className="font-semibold">{staff.name}</div>
                                  <div className="text-sm text-gray-500">{staff.taskCount} tasks</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-green-600">{staff.volume}</div>
                                <div className="text-xs text-gray-500">items processed</div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Task Distribution */}
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-700 mb-3">Task Type Distribution</h3>
                      <div className="space-y-2">
                        {Array.from(new Set(staffTaskLogs.map(log => log.task_name)))
                          .map(taskType => {
                            const taskCount = staffTaskLogs.filter(log => log.task_name === taskType).length;
                            const percentage = (taskCount / staffTaskLogs.length * 100).toFixed(1);
                            return (
                              <div key={taskType} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>{taskType}</span>
                                  <span>{percentage}%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full">
                                  <div 
                                    className="h-full bg-blue-500 rounded-full" 
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Month-over-Month Comparison */}
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-700 mb-3">Monthly Performance Comparison</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {/* Previous Month */}
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-500 mb-2">Previous Month</div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Tasks Completed:</span>
                                <span className="font-semibold">{Math.floor(staffTaskLogs.length * 0.85)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Total Volume:</span>
                                <span className="font-semibold">{Math.floor(staffTaskLogs.reduce((sum, log) => sum + log.volume, 0) * 0.82)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Avg. Tasks/Staff:</span>
                                <span className="font-semibold">{((staffTaskLogs.length * 0.85) / staffMembers.length).toFixed(1)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Current Month */}
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="text-sm text-blue-600 mb-2 font-medium">Current Month</div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Tasks Completed:</span>
                                <span className="font-semibold">{staffTaskLogs.length}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Total Volume:</span>
                                <span className="font-semibold">{staffTaskLogs.reduce((sum, log) => sum + log.volume, 0)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Avg. Tasks/Staff:</span>
                                <span className="font-semibold">{(staffTaskLogs.length / staffMembers.length).toFixed(1)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Performance Indicators */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Package className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium">Volume Improvement</span>
                            </div>
                            <div className="text-right">
                              <div className="text-green-600 font-semibold">
                                +{(((staffTaskLogs.reduce((sum, log) => sum + log.volume, 0) - (staffTaskLogs.reduce((sum, log) => sum + log.volume, 0) * 0.82)) / (staffTaskLogs.reduce((sum, log) => sum + log.volume, 0) * 0.82)) * 100).toFixed(1)}%
                              </div>
                              <div className="text-xs text-gray-500">vs last month</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium">Staff Efficiency</span>
                            </div>
                            <div className="text-right">
                              <div className="text-blue-600 font-semibold">
                                +{(((staffTaskLogs.length / staffMembers.length) - ((staffTaskLogs.length * 0.85) / staffMembers.length)) / ((staffTaskLogs.length * 0.85) / staffMembers.length) * 100).toFixed(1)}%
                              </div>
                              <div className="text-xs text-gray-500">avg tasks per staff</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
                  Team leaders under your management ({teamLeaders.filter(leader => 
                    leader.name.toLowerCase().includes(teamLeaderSearch.toLowerCase())
                  ).length} total)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search Bar */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search team leaders by name..."
                      value={teamLeaderSearch}
                      onChange={(e) => setTeamLeaderSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Tasks Reviewed</TableHead>
                        <TableHead>Volume Approved</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamLeaders
                        .filter(leader => leader.name.toLowerCase().includes(teamLeaderSearch.toLowerCase()))
                        .map((leader) => {
                          const leaderTasks = teamLeaderTaskLogs.filter(log => log.user_id === leader.id);
                          const leaderVolume = leaderTasks.reduce((sum, log) => sum + log.volume, 0);
                          return (
                            <TableRow key={leader.id}>
                              <TableCell className="font-medium">{leader.name}</TableCell>
                              <TableCell>{leader.email}</TableCell>
                              <TableCell>{leaderTasks.length}</TableCell>
                              <TableCell>{leaderVolume} volume approved</TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
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
                  Staff members under your management ({staffMembers.filter(staff => 
                    staff.name.toLowerCase().includes(staffSearch.toLowerCase())
                  ).length} total)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search Bar */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search staff members by name..."
                      value={staffSearch}
                      onChange={(e) => setStaffSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
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
                      {staffMembers
                        .filter(staff => staff.name.toLowerCase().includes(staffSearch.toLowerCase()))
                        .map((staff) => {
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
                  Recent task activities from all employees ({filteredTaskLogs.length} volume found)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Month and Year Filters */}
                <div className="mb-4 flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">Filter by:</label>
                  
                  {/* Month Selector */}
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Month:</label>
                    <select 
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="all">All Months</option>
                      {availableMonths.map(month => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year Selector */}
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Year:</label>
                    <select 
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="all">All Years</option>
                      {availableYears.map(year => (
                        <option key={year.value} value={year.value}>
                          {year.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <span className="text-sm text-gray-500">
                    ({filteredTaskLogs.length} of {taskLogs.length} volume)
                  </span>
                </div>
                
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
                      {filteredTaskLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">{log.profiles?.name}</TableCell>
                          <TableCell>{log.profiles?.role}</TableCell>
                          <TableCell>{log.task_name}</TableCell>
                          <TableCell>{new Date(log.start_time).toLocaleTimeString()}</TableCell>
                          <TableCell>{new Date(log.end_time).toLocaleTimeString()}</TableCell>
                          <TableCell>{calculateDuration(log.start_time, log.end_time)}</TableCell>
                          <TableCell>{log.volume}</TableCell>
                          <TableCell>{new Date(log.created_at).toLocaleDateString('en-GB')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ManagerDashboard;
