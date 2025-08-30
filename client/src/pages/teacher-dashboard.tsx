import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function TeacherDashboard() {
  const { user, loading } = useAuth();
  const [classStats, setClassStats] = useState<any>(null);
  const [topStudents, setTopStudents] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);

  useEffect(() => {
    if (user && user.role === "teacher") {
      fetchClassData();
    }
  }, [user]);

  const fetchClassData = async () => {
    try {
      // Fetch all students
      const studentsQuery = query(
        collection(db, "users"),
        where("role", "==", "student")
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      const students = studentsSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

      // Calculate class statistics
      const totalStudents = students.length;
      const totalPoints = students.reduce((sum: number, student: any) => sum + (student.totalPoints || 0), 0);
      const totalBadges = students.reduce((sum: number, student: any) => sum + (student.badges?.length || 0), 0);
      const averageScore = totalStudents > 0 ? Math.round(totalPoints / totalStudents) : 0;

      // Count active students (last active within 24 hours)
      const now = new Date();
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const activeToday = students.filter((student: any) => {
        const lastActive = student.lastActive?.toDate ? student.lastActive.toDate() : new Date(student.lastActive);
        return lastActive > dayAgo;
      }).length;

      setClassStats({
        totalStudents,
        averageScore,
        totalBadges,
        activeToday
      });

      // Get top students
      const sortedStudents = students
        .sort((a: any, b: any) => (b.totalPoints || 0) - (a.totalPoints || 0))
        .slice(0, 10)
        .map((student: any, index: number) => ({
          ...student,
          rank: index + 1
        }));
      
      setTopStudents(sortedStudents);

      // Generate mock progress data for chart
      const mockProgressData = [
        { week: "Week 1", averageScore: 120 },
        { week: "Week 2", averageScore: 180 },
        { week: "Week 3", averageScore: 250 },
        { week: "Week 4", averageScore: 320 },
        { week: "Week 5", averageScore: averageScore }
      ];
      setProgressData(mockProgressData);

    } catch (error) {
      console.error("Error fetching class data:", error);
    }
  };

  const exportToCSV = () => {
    if (topStudents.length === 0) return;

    const csvContent = [
      ["Name", "Email", "Total Points", "Badges", "Level", "Rank"].join(","),
      ...topStudents.map(student => [
        student.name,
        student.email,
        student.totalPoints || 0,
        student.badges?.length || 0,
        student.level || 1,
        student.rank
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "class_performance.csv";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== "teacher") {
    return <LoginForm role="teacher" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Teacher Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center">
                    <i className="fas fa-chalkboard-teacher text-xl sm:text-2xl text-white"></i>
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-lg sm:text-2xl font-bold text-foreground">{user.name}</h2>
                    <p className="text-sm text-muted-foreground">Environmental Science Teacher</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <Button onClick={exportToCSV} className="bg-primary hover:bg-primary/90 w-full sm:w-auto" data-testid="button-export-csv">
                    <i className="fas fa-download mr-2"></i>Export CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Analytics Overview Cards */}
        {classStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8"
          >
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-xs sm:text-sm font-medium">Total Students</p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">{classStats.totalStudents}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-users text-primary text-lg sm:text-xl"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-xs sm:text-sm font-medium">Average Score</p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">{classStats.averageScore}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-chart-line text-secondary text-lg sm:text-xl"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-xs sm:text-sm font-medium">Badges Earned</p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">{classStats.totalBadges}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-medal text-accent text-lg sm:text-xl"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-xs sm:text-sm font-medium">Active Today</p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">{classStats.activeToday}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-user-check text-green-500 text-lg sm:text-xl"></i>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Analytics Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
          {/* Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base sm:text-lg">
                <i className="fas fa-chart-line text-primary mr-2"></i>
                <span className="hidden sm:inline">Student Progress Over Time</span>
                <span className="sm:hidden">Student Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="averageScore" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Game Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base sm:text-lg">
                <i className="fas fa-gamepad text-secondary mr-2"></i>
                <span className="hidden sm:inline">Game Performance</span>
                <span className="sm:hidden">Games</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { game: "Waste Sort", completion: 85 },
                    { game: "Water Saver", completion: 72 },
                    { game: "Plant Tree", completion: 91 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="game" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completion" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Students Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <i className="fas fa-trophy text-accent mr-2"></i>
                  Top Planet Heroes
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topStudents.map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        index === 0 ? "bg-gradient-to-br from-yellow-400 to-yellow-600" :
                        index === 1 ? "bg-gradient-to-br from-gray-300 to-gray-400" :
                        index === 2 ? "bg-gradient-to-br from-amber-600 to-orange-500" :
                        "bg-muted"
                      }`}>
                        {student.rank}
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                        {student.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.badges?.length || 0} badges earned
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground text-lg">{student.totalPoints || 0}</p>
                      <p className="text-sm text-muted-foreground">points</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
