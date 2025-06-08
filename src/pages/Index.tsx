
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

// Clock Component for ATT System
const AttendanceClock = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <defs>
      <style>
        {`.clock-face { fill: #ffcc00; stroke: #dd0000; stroke-width: 3; }
         .clock-numbers { fill: #dd0000; font-family: Arial, sans-serif; font-weight: bold; font-size: 8px; }
         .clock-hands { stroke: #dd0000; stroke-width: 2; stroke-linecap: round; }
         .clock-center { fill: #dd0000; }
         .clock-ticks { stroke: #dd0000; stroke-width: 1; }`}
      </style>
    </defs>
    
    {/* Clock face */}
    <circle cx="50" cy="50" r="45" className="clock-face"/>
    
    {/* Hour markers */}
    <line x1="50" y1="10" x2="50" y2="20" className="clock-ticks"/>
    <line x1="85" y1="35" x2="75" y2="40" className="clock-ticks"/>
    <line x1="90" y1="50" x2="80" y2="50" className="clock-ticks"/>
    <line x1="85" y1="65" x2="75" y2="60" className="clock-ticks"/>
    <line x1="50" y1="90" x2="50" y2="80" className="clock-ticks"/>
    <line x1="15" y1="65" x2="25" y2="60" className="clock-ticks"/>
    <line x1="10" y1="50" x2="20" y2="50" className="clock-ticks"/>
    <line x1="15" y1="35" x2="25" y2="40" className="clock-ticks"/>
    
    {/* Key numbers */}
    <text x="50" y="18" textAnchor="middle" className="clock-numbers">12</text>
    <text x="82" y="55" textAnchor="middle" className="clock-numbers">3</text>
    <text x="50" y="87" textAnchor="middle" className="clock-numbers">6</text>
    <text x="18" y="55" textAnchor="middle" className="clock-numbers">9</text>
    
    {/* Clock hands - showing 9:00 (work start time) */}
    <line x1="50" y1="50" x2="50" y2="30" className="clock-hands"/>  {/* Hour hand */}
    <line x1="50" y1="50" x2="20" y2="50" className="clock-hands"/>  {/* Minute hand */}
    
    {/* Center dot */}
    <circle cx="50" cy="50" r="3" className="clock-center"/>
  </svg>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-300 to-yellow-200">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-1 rounded-lg">
                <AttendanceClock className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">DHL ATT System</h1>
                <p className="text-xs text-gray-500">Attendance Tracking System</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link to="/signin">
                <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50 bg-white">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-red-600 hover:bg-red-700 text-white shadow-lg">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to DHL
            <span className="text-red-600"> ATT System</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Streamline your attendance tracking with our comprehensive system designed for managers, team leaders, and staff members.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/signup">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg">
                Get Started
              </Button>
            </Link>
            <Link to="/signin">
              <Button size="lg" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 px-8 py-3 text-lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
            <CardHeader className="text-center pb-4">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">Role-Based Access</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 text-center">
                Different access levels for managers, team leaders, and staff members with hierarchical management structure.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
            <CardHeader className="text-center pb-4">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">Real-time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 text-center">
                Monitor attendance in real-time with comprehensive reporting and analytics for better workforce management.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
            <CardHeader className="text-center pb-4">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">Secure & Reliable</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 text-center">
                Enterprise-grade security with reliable data protection and seamless integration with DHL systems.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-xl mb-8 text-red-100">
            Join thousands of DHL employees already using our attendance tracking system.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="bg-white text-red-600 hover:bg-gray-50 px-8 py-3 text-lg font-semibold">
              Create Your Account
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-3 mb-4">
              <div className="p-1 rounded-lg">
                <AttendanceClock className="h-8 w-8" />
              </div>
              <span className="text-xl font-bold">DHL ATT System</span>
            </div>
            <p className="text-gray-400">
              © 2024 DHL. All rights reserved. Attendance Tracking System.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
