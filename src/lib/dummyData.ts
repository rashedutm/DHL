// Malaysian names for dummy data
export const malaysianNames = {
  teamLeaders: [
    { id: 'tl1', name: 'Ahmad bin Abdullah', email: 'ahmad.abdullah@dhl.com', role: 'team_leader' },
    { id: 'tl2', name: 'Siti binti Rahman', email: 'siti.rahman@dhl.com', role: 'team_leader' },
    { id: 'tl3', name: 'Raj Kumar a/l Muthu', email: 'raj.kumar@dhl.com', role: 'team_leader' },
    { id: 'tl4', name: 'Wong Mei Ling', email: 'wong.mei@dhl.com', role: 'team_leader' },
    { id: 'tl5', name: 'Mohammad bin Ismail', email: 'mohammad.ismail@dhl.com', role: 'team_leader' },
    { id: 'tl6', name: 'Nurul Huda binti Ali', email: 'nurul.huda@dhl.com', role: 'team_leader' },
    { id: 'tl7', name: 'Krishnan a/l Subramaniam', email: 'krishnan.subra@dhl.com', role: 'team_leader' },
    { id: 'tl8', name: 'Tan Wei Chen', email: 'tan.wei@dhl.com', role: 'team_leader' },
    { id: 'tl9', name: 'Fatimah binti Hassan', email: 'fatimah.hassan@dhl.com', role: 'team_leader' },
    { id: 'tl10', name: 'Lee Chong Wei', email: 'lee.chong@dhl.com', role: 'team_leader' },
    { id: 'tl11', name: 'Aisha binti Omar', email: 'aisha.omar@dhl.com', role: 'team_leader' },
    { id: 'tl12', name: 'Ganesh a/l Raj', email: 'ganesh.raj@dhl.com', role: 'team_leader' },
    { id: 'tl13', name: 'Lim Wei Jie', email: 'lim.wei@dhl.com', role: 'team_leader' },
    { id: 'tl14', name: 'Nurul Ain binti Ahmad', email: 'nurul.ain@dhl.com', role: 'team_leader' },
    { id: 'tl15', name: 'Vijay a/l Kumar', email: 'vijay.kumar@dhl.com', role: 'team_leader' },
  ],
  staffMembers: [
    // Team 1 (10 staff)
    { id: 's1', name: 'Mohammad bin Ismail', email: 'mohammad.ismail@dhl.com', role: 'staff', team_leader_id: 'tl1' },
    { id: 's2', name: 'Nurul Huda binti Ali', email: 'nurul.huda@dhl.com', role: 'staff', team_leader_id: 'tl1' },
    { id: 's3', name: 'Krishnan a/l Subramaniam', email: 'krishnan.subra@dhl.com', role: 'staff', team_leader_id: 'tl1' },
    { id: 's4', name: 'Tan Wei Chen', email: 'tan.wei@dhl.com', role: 'staff', team_leader_id: 'tl1' },
    { id: 's5', name: 'Fatimah binti Hassan', email: 'fatimah.hassan@dhl.com', role: 'staff', team_leader_id: 'tl1' },
    { id: 's6', name: 'Lee Chong Wei', email: 'lee.chong@dhl.com', role: 'staff', team_leader_id: 'tl1' },
    { id: 's7', name: 'Aisha binti Omar', email: 'aisha.omar@dhl.com', role: 'staff', team_leader_id: 'tl1' },
    { id: 's8', name: 'Ganesh a/l Raj', email: 'ganesh.raj@dhl.com', role: 'staff', team_leader_id: 'tl1' },
    { id: 's9', name: 'Lim Wei Jie', email: 'lim.wei@dhl.com', role: 'staff', team_leader_id: 'tl1' },
    { id: 's10', name: 'Nurul Ain binti Ahmad', email: 'nurul.ain@dhl.com', role: 'staff', team_leader_id: 'tl1' },

    // Team 2 (10 staff)
    { id: 's11', name: 'Vijay a/l Kumar', email: 'vijay.kumar@dhl.com', role: 'staff', team_leader_id: 'tl2' },
    { id: 's12', name: 'Sarah binti Abdullah', email: 'sarah.abdullah@dhl.com', role: 'staff', team_leader_id: 'tl2' },
    { id: 's13', name: 'Rajesh a/l Muthu', email: 'rajesh.muthu@dhl.com', role: 'staff', team_leader_id: 'tl2' },
    { id: 's14', name: 'Wong Mei Yee', email: 'wong.mei.yee@dhl.com', role: 'staff', team_leader_id: 'tl2' },
    { id: 's15', name: 'Mohammad bin Hassan', email: 'mohammad.hassan@dhl.com', role: 'staff', team_leader_id: 'tl2' },
    { id: 's16', name: 'Nurul Izzah binti Ali', email: 'nurul.izzah@dhl.com', role: 'staff', team_leader_id: 'tl2' },
    { id: 's17', name: 'Kumar a/l Subramaniam', email: 'kumar.subra@dhl.com', role: 'staff', team_leader_id: 'tl2' },
    { id: 's18', name: 'Tan Wei Ming', email: 'tan.wei.ming@dhl.com', role: 'staff', team_leader_id: 'tl2' },
    { id: 's19', name: 'Fatimah binti Omar', email: 'fatimah.omar@dhl.com', role: 'staff', team_leader_id: 'tl2' },
    { id: 's20', name: 'Lee Wei Chen', email: 'lee.wei.chen@dhl.com', role: 'staff', team_leader_id: 'tl2' },

    // Continue with more teams...
    // Team 3-15 (10 staff each)
    ...Array.from({ length: 13 }, (_, teamIndex) => {
      const teamLeaderId = `tl${teamIndex + 3}`;
      return Array.from({ length: 10 }, (_, staffIndex) => {
        const staffId = `s${(teamIndex + 2) * 10 + staffIndex + 1}`;
        const nameIndex = (teamIndex * 10 + staffIndex) % 20; // Cycle through names
        const names = [
          'Ahmad bin Abdullah', 'Siti binti Rahman', 'Raj Kumar a/l Muthu', 'Wong Mei Ling',
          'Mohammad bin Ismail', 'Nurul Huda binti Ali', 'Krishnan a/l Subramaniam', 'Tan Wei Chen',
          'Fatimah binti Hassan', 'Lee Chong Wei', 'Aisha binti Omar', 'Ganesh a/l Raj',
          'Lim Wei Jie', 'Nurul Ain binti Ahmad', 'Vijay a/l Kumar', 'Sarah binti Abdullah',
          'Rajesh a/l Muthu', 'Wong Mei Yee', 'Mohammad bin Hassan', 'Nurul Izzah binti Ali'
        ];
        const name = names[nameIndex];
        const email = name.toLowerCase().replace(/\s+/g, '.') + '@dhl.com';
        return {
          id: staffId,
          name,
          email,
          role: 'staff',
          team_leader_id: teamLeaderId
        };
      });
    }).flat()
  ]
};

// Task types for realistic task names
const taskTypes = [
  'Package Sorting',
  'Document Processing',
  'Customs Clearance',
  'Inventory Check',
  'Quality Control',
  'Label Verification',
  'Route Planning',
  'Customer Service',
  'Data Entry',
  'Warehouse Organization',
  'International Shipping',
  'Local Delivery',
  'Returns Processing',
  'Express Handling',
  'Special Cargo'
];

// Generate random time between 9 AM and 5 PM
const getRandomTime = () => {
  const hours = Math.floor(Math.random() * 8) + 9; // 9 AM to 5 PM
  const minutes = Math.floor(Math.random() * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Generate random date within the last 12 months
const getRandomDateForMonth = (monthOffset: number) => {
  const date = new Date();
  date.setMonth(date.getMonth() - monthOffset);
  // Random day in that month
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.floor(Math.random() * daysInMonth) + 1);
  return date.toISOString().split('T')[0];
};

// Generate dummy task logs across multiple years and 12 months
export const generateDummyTaskLogs = () => {
  const allEmployees = [...malaysianNames.teamLeaders, ...malaysianNames.staffMembers];
  const taskLogs = [];
  const currentYear = new Date().getFullYear();

  // Generate 1-6 total tasks per employee across all time periods
  allEmployees.forEach(employee => {
    // Each employee gets 1-6 total tasks (not per month)
    const totalTasksForEmployee = Math.floor(Math.random() * 6) + 1; // 1-6 total tasks
    
    for (let taskIndex = 0; taskIndex < totalTasksForEmployee; taskIndex++) {
      // Randomly pick a year (current or previous)
      const yearOffset = Math.floor(Math.random() * 2); // 0 or 1
      const targetYear = currentYear - yearOffset;
      
      // Randomly pick a month (0-11)
      const month = Math.floor(Math.random() * 12);
      
      const startTime = getRandomTime();
      const endTime = getRandomTime();
      const date = getRandomDateForYearMonth(targetYear, month);
      
      taskLogs.push({
        id: `task_${employee.id}_${targetYear}_${month}_${taskIndex}`,
        task_name: taskTypes[Math.floor(Math.random() * taskTypes.length)],
        start_time: startTime,
        end_time: endTime,
        volume: Math.floor(Math.random() * 20) + 5, // Keep volume between 5-25 items per task
        created_at: date,
        user_id: employee.id,
        profiles: {
          name: employee.name,
          email: employee.email,
          role: employee.role
        }
      });
    }
  });

  return taskLogs;
};

// Generate random date for specific year and month
const getRandomDateForYearMonth = (year: number, month: number) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const day = Math.floor(Math.random() * daysInMonth) + 1;
  const date = new Date(year, month, day);
  return date.toISOString().split('T')[0];
};

// Get activity multiplier for different years (simulating business growth/decline)
const getYearActivityMultiplier = (yearOffset: number) => {
  switch (yearOffset) {
    case 0: return 1.0;    // Current year - baseline
    case 1: return 0.9;    // Last year - 10% less activity
    default: return 1.0;
  }
};

// Get activity multiplier for different months (simulating seasonal patterns)
const getMonthActivityMultiplier = (month: number) => {
  // Activity patterns: Higher during holiday seasons (Nov-Dec), lower in summer
  const monthPatterns = {
    0: 1.5,  // January - Post-holiday high
    1: 1.2,  // February - Normal
    2: 1.3,  // March - Spring increase
    3: 1.1,  // April - Moderate
    4: 1.0,  // May - Normal
    5: 0.8,  // June - Summer low
    6: 0.7,  // July - Summer vacation
    7: 0.8,  // August - Summer low
    8: 1.1,  // September - Back to work
    9: 1.3,  // October - Pre-holiday prep
    10: 1.6, // November - Holiday season
    11: 1.8  // December - Holiday peak
  };
  
  return monthPatterns[month as keyof typeof monthPatterns] || 1.0;
};

// Generate dummy manager profile
export const dummyManagerProfile = {
  id: 'm1',
  name: 'Mr. Siva',
  email: 'siva@dhl.com',
  role: 'manager'
}; 