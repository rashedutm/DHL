import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Users, Clock, Package, TrendingUp, Search, Bell, CheckCircle, AlertCircle, Info, UserCheck, ChevronDown, ChevronUp, Star, Check, X, Calendar } from "lucide-react";
import { cn } from '@/lib/utils';
import { malaysianNames, generateDummyTaskLogs } from "@/lib/dummyData"; // Import dummy data

interface TaskLog {
  id: string;
  task_name: string;
  start_time: string;
  end_time: string;
  volume: number;
  created_at: string;
  user_id: string;
  status?: 'pending' | 'approved' | 'rejected';
  profiles?: {
    name: string;
    email: string;
    role: string;
  };
}

interface TeamMember {
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

// Dummy team leader profile
const dummyTeamLeaderProfile = {
  id: 'tl_001',
  name: 'Ahmad bin Abdullah',
  email: 'ahmad.abdullah@dhl.com',
  role: 'team_leader'
};

const TeamLeaderDashboard = () => {
  const [userProfile, setUserProfile] = useState<any>(dummyTeamLeaderProfile);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  const [staffSearch, setStaffSearch] = useState('');
  const [taskLogSearch, setTaskLogSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'tl1',
      title: 'Missing Task Input',
      message: `${malaysianNames.staffMembers[0]?.name || 'Mohammad bin Ismail'} hasn't submitted today's task yet. Please follow up.`,
      type: 'error',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: false
    },
    {
      id: 'tl2',
      title: 'Task Approval Needed',
      message: `${malaysianNames.staffMembers[1]?.name || 'Staff member'} has submitted 5 tasks for approval.`,
      type: 'info',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      read: false
    },
    {
      id: 'tl3',
      title: 'Incomplete Task Data',
      message: `${malaysianNames.staffMembers[2]?.name || 'Staff member'} logged a task without proper volume information. Please review.`,
      type: 'warning',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false
    },
    {
      id: 'tl4',
      title: 'High Performer Alert',
      message: `${malaysianNames.staffMembers[3]?.name || 'Staff member'} exceeded daily volume target by 30%.`,
      type: 'success',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      read: false
    },
    {
      id: 'tl5',
      title: 'Low Activity Warning',
      message: `${malaysianNames.staffMembers[4]?.name || 'Staff member'} has logged only 2 tasks today.`,
      type: 'warning',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: 'tl6',
      title: 'Training Reminder',
      message: 'Team safety training scheduled for tomorrow at 10:00 AM.',
      type: 'info',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: 'tl7',
      title: 'Outstanding Performance',
      message: `${malaysianNames.staffMembers[5]?.name || 'Staff member'} completed 25% more tasks than average this week.`,
      type: 'success',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      read: false
    }
  ]);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadDummyData();
  }, []);

  // Added useEffect for closing notifications dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showNotifications && !target.closest('.notification-dropdown-tl')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const loadDummyData = async () => {
    try {
      // Simulate loading delay
      setTimeout(() => {
        // Get team members assigned to this team leader (first 8 staff members)
        const myTeamMembers = malaysianNames.staffMembers.slice(0, 8).map(staff => ({
          ...staff,
          team_leader_id: dummyTeamLeaderProfile.id
        }));
        
        setTeamMembers(myTeamMembers);

        // Generate task logs and filter for this team
        const allTaskLogs = generateDummyTaskLogs();
        const teamMemberIds = myTeamMembers.map(member => member.id);
        
        // Filter task logs for team members and add profile info
        const teamTaskLogs = allTaskLogs
          .filter(log => teamMemberIds.includes(log.user_id))
          .map((log, index) => {
            const member = myTeamMembers.find(m => m.id === log.user_id);
            const logDate = new Date(log.created_at);
            const today = new Date();
            const daysDiff = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
            
            // Assign status based on realistic scenarios
            let status: 'pending' | 'approved' | 'rejected';
            
            if (daysDiff === 0) {
              // Today's tasks: 30% pending, 70% approved (some still need approval)
              status = Math.random() < 0.3 ? 'pending' : 'approved';
            } else if (daysDiff <= 7) {
              // Last 7 days: 15% pending, 80% approved, 5% rejected
              const rand = Math.random();
              if (rand < 0.15) status = 'pending';
              else if (rand < 0.95) status = 'approved';
              else status = 'rejected';
            } else {
              // Older tasks: mostly approved with some rejected
              status = Math.random() < 0.9 ? 'approved' : 'rejected';
            }
            
            return {
              ...log,
              status,
              profiles: member ? {
                name: member.name,
                email: member.email,
                role: member.role
              } : {
                name: 'Unknown',
                email: 'Unknown',
                role: 'staff'
              }
            };
          });

        setTaskLogs(teamTaskLogs);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading dummy data:', error);
      toast({
        title: "Error",
        description: "Failed to load team data",
        variant: "destructive"
      });
      setLoading(false);
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

  const handleSignOut = () => {
    navigate('/signin');
  };

  // Notification helper functions (similar to ManagerDashboard)
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

  // Functions for handling approval/rejection
  const handleApproveTask = (taskId: string) => {
    setTaskLogs(prev => 
      prev.map(log => 
        log.id === taskId 
          ? { ...log, status: 'approved' as const }
          : log
      )
    );
    toast({
      title: "Task Approved",
      description: "Task has been approved successfully.",
      variant: "default"
    });
  };

  const handleRejectTask = (taskId: string) => {
    setTaskLogs(prev => 
      prev.map(log => 
        log.id === taskId 
          ? { ...log, status: 'rejected' as const }
          : log
      )
    );
    toast({
      title: "Task Rejected",
      description: "Task has been rejected.",
      variant: "destructive"
    });
  };

  // Get last 7 days pending submissions
  const getLast7DaysPendingSubmissions = () => {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return taskLogs.filter(log => {
      const logDate = new Date(log.created_at);
      return logDate >= sevenDaysAgo && log.status === 'pending';
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  // Get last 7 days processed submissions (approved/rejected)
  const getLast7DaysProcessedSubmissions = () => {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return taskLogs.filter(log => {
      const logDate = new Date(log.created_at);
      return logDate >= sevenDaysAgo && (log.status === 'approved' || log.status === 'rejected');
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

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
  const totalVolume = taskLogs.reduce((sum, log) => sum + log.volume, 0);

  // Filtering and sorting logic for task logs
  const getFilteredTeamTaskLogs = () => {
    return taskLogs
      .filter(log => {
        const logDate = new Date(log.created_at);
        const logMonth = logDate.getMonth();
        const logYear = logDate.getFullYear();
        
        const monthMatch = selectedMonth === 'all' || logMonth === parseInt(selectedMonth);
        const yearMatch = selectedYear === 'all' || logYear === parseInt(selectedYear);
        
        const searchTermLower = taskLogSearch.toLowerCase();
        const searchMatch = taskLogSearch === '' || 
                            log.task_name.toLowerCase().includes(searchTermLower) || 
                            (log.profiles?.name.toLowerCase().includes(searchTermLower));

        return monthMatch && yearMatch && searchMatch;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); // Sort by date descending
  };

  const getAvailableTeamYears = () => {
    const years = new Set<number>();
    taskLogs.forEach(log => {
      years.add(new Date(log.created_at).getFullYear());
    });
    return Array.from(years).sort((a,b) => b - a).map(year => ({ value: year.toString(), label: year.toString() }));
  };

  const getAvailableTeamMonths = () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames.map((monthName, index) => ({ value: index.toString(), label: monthName }));
  };

  const filteredTeamTaskLogs = getFilteredTeamTaskLogs();
  const availableTeamMonths = getAvailableTeamMonths();
  const availableTeamYears = getAvailableTeamYears();
  const last7DaysPendingSubmissions = getLast7DaysPendingSubmissions();
  const last7DaysProcessedSubmissions = getLast7DaysProcessedSubmissions();

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
          <div className="flex items-center space-x-4">
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
              
              {showNotifications && (
                <div className="notification-dropdown-tl absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
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
              <p className="text-sm text-gray-600">Active staff in your team</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Package className="h-5 w-5 text-green-600" />
                <span>Team Volume (Current Month)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* This is a dummy value. Actual calculation would need date filtering on taskLogs */}
              <div className="text-2xl font-bold text-green-600">1250</div> 
              <p className="text-sm text-gray-600">Items processed by team</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <UserCheck className="h-5 w-5 text-orange-600" /> {/* Changed Icon */}
                <span>Pending Approvals</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{last7DaysPendingSubmissions.length}</div> 
              <p className="text-sm text-gray-600">Tasks awaiting your review</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4"> {/* Adjusted to 4 columns */}
            <TabsTrigger value="overview">Team Overview</TabsTrigger>
            <TabsTrigger value="staff-details">Staff Details</TabsTrigger>
            <TabsTrigger value="pending-approvals" className="relative">
              Pending Approvals
              {last7DaysPendingSubmissions.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {last7DaysPendingSubmissions.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="task-logs">Task Logs</TabsTrigger>
          </TabsList>

          {/* Team Overview Tab */}
          <TabsContent value="overview">
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Team Performance Overview</span>
                </CardTitle>
                <CardDescription>
                  Summary of your team's current performance and activities.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stats: Avg tasks/staff, Avg volume/staff */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-500">Avg Tasks / Staff</div>
                    <div className="text-xl font-semibold">
                      {teamMembers.length > 0 ? (taskLogs.length / teamMembers.length).toFixed(1) : '0'}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-500">Avg Volume / Staff</div>
                    <div className="text-xl font-semibold">
                      {teamMembers.length > 0 ? (taskLogs.reduce((sum, log) => sum + log.volume, 0) / teamMembers.length).toFixed(1) : '0'}
                    </div>
                  </div>
                </div>

                {/* Top Performing Staff (by volume) - Show ALL staff members */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Top Performing Staff (by Volume)</h3>
                  <div className="space-y-3">
                    {teamMembers
                      .map(member => {
                        const memberLogs = taskLogs.filter(log => log.user_id === member.id);
                        const memberVolume = memberLogs.reduce((sum, log) => sum + log.volume, 0);
                        return { ...member, volume: memberVolume, taskCount: memberLogs.length };
                      })
                      .sort((a, b) => b.volume - a.volume)
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
                            <div className="text-xs text-gray-500">volume</div>
                          </div>
                        </div>
                      ))}
                    {teamMembers.length === 0 && <p className="text-sm text-gray-500">No staff data available.</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Approvals Tab */}
          <TabsContent value="pending-approvals">
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  <span>Last 7 Days Pending Submissions</span>
                </CardTitle>
                <CardDescription>
                  Review and approve task submissions from your team members in the last 7 days. ({last7DaysPendingSubmissions.length} pending submissions)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {last7DaysPendingSubmissions.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
                    <p className="text-gray-600">No pending submissions for today. Great job!</p>
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
                          <TableHead>Submitted At</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {last7DaysPendingSubmissions.map((log) => (
                          <TableRow key={log.id} className="bg-yellow-50">
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
                            <TableCell className="font-semibold">{log.volume}</TableCell>
                            <TableCell>{new Date(log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApproveTask(log.id)}
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                  title="Approve Task"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRejectTask(log.id)}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                  title="Reject Task"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
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

          {/* Staff Details Tab */}
          <TabsContent value="staff-details">
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span>Staff Member Details</span>
                </CardTitle>
                <CardDescription>
                  View performance details for each member of your team. ({teamMembers.filter(member => member.name.toLowerCase().includes(staffSearch.toLowerCase())).length} members found)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search Bar for Staff */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search staff by name..."
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
                        <TableHead>Tasks Completed</TableHead>
                        <TableHead>Total Volume</TableHead>
                        <TableHead>Avg. Volume/Task</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamMembers
                        .filter(member => member.name.toLowerCase().includes(staffSearch.toLowerCase()))
                        .map((member) => {
                          const memberLogs = taskLogs.filter(log => log.user_id === member.id);
                          const memberTaskCount = memberLogs.length;
                          const memberTotalVolume = memberLogs.reduce((sum, log) => sum + log.volume, 0);
                          const avgVolumePerTask = memberTaskCount > 0 ? (memberTotalVolume / memberTaskCount).toFixed(1) : '0';
                          return (
                            <TableRow key={member.id}>
                              <TableCell className="font-medium">
                                <div className="font-semibold">{member.name}</div>
                              </TableCell>
                              <TableCell>{member.email}</TableCell>
                              <TableCell>{memberTaskCount}</TableCell>
                              <TableCell>{memberTotalVolume}</TableCell>
                              <TableCell>{avgVolumePerTask}</TableCell>
                            </TableRow>
                          );
                        })}
                        {teamMembers.filter(member => member.name.toLowerCase().includes(staffSearch.toLowerCase())).length === 0 && (
                           <TableRow>
                            <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                              No staff members match your search.
                            </TableCell>
                          </TableRow>
                        )}
                        {teamMembers.length === 0 && (
                           <TableRow>
                            <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                              No staff members in your team yet.
                            </TableCell>
                          </TableRow>
                        )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Task Logs Tab */}
          <TabsContent value="task-logs">
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-red-600" />
                  <span>Team Task Logs</span>
                </CardTitle>
                <CardDescription>
                  Review task logs submitted by your team. ({filteredTeamTaskLogs.length} logs found)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters: Month, Year, Search */}
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  {/* Month Selector */}
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Month:</label>
                    <select 
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 min-w-[120px]"
                    >
                      <option value="all">All Months</option>
                      {availableTeamMonths.map(month => (
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
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 min-w-[100px]"
                    >
                      <option value="all">All Years</option>
                      {availableTeamYears.map(year => (
                        <option key={year.value} value={year.value}>
                          {year.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Search Bar for Task Logs */}
                  <div className="relative flex-grow min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by task or staff name..."
                      value={taskLogSearch}
                      onChange={(e) => setTaskLogSearch(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>
                  <span className="text-sm text-gray-500">
                    ({filteredTeamTaskLogs.length} of {taskLogs.length} logs)
                  </span>
                </div>

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
                        <TableHead>Date (DD/MM/YYYY)</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTeamTaskLogs.map((log) => (
                        <TableRow key={log.id} className={cn(
                          log.status === 'approved' && 'bg-green-50',
                          log.status === 'rejected' && 'bg-red-50',
                          log.status === 'pending' && 'bg-yellow-50'
                        )}>
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
                          <TableCell>{new Date(log.created_at).toLocaleDateString('en-GB')}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {log.status === 'approved' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approved
                                </span>
                              )}
                              {log.status === 'rejected' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  <X className="h-3 w-3 mr-1" />
                                  Rejected
                                </span>
                              )}
                              {log.status === 'pending' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pending
                                </span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredTeamTaskLogs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-gray-500 py-4">
                            No task logs match your filters.
                          </TableCell>
                        </TableRow>
                      )}
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

export default TeamLeaderDashboard;
