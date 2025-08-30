import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { collection, query, orderBy, limit, getDocs, startAfter } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LeaderboardEntry } from "@shared/schema";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async (loadMore = false) => {
    try {
      setLoading(!loadMore);
      
      let leaderboardQuery = query(
        collection(db, "users"),
        orderBy("totalPoints", "desc"),
        limit(20)
      );

      if (loadMore && leaderboard.length > 0) {
        const lastDoc = leaderboard[leaderboard.length - 1];
        leaderboardQuery = query(
          collection(db, "users"),
          orderBy("totalPoints", "desc"),
          startAfter(lastDoc.totalPoints),
          limit(20)
        );
      }

      const snapshot = await getDocs(leaderboardQuery);
      const users = snapshot.docs.map((doc, index) => {
        const data = doc.data();
        return {
          userId: doc.id,
          name: data.name,
          totalPoints: data.totalPoints || 0,
          badges: data.badges || [],
          level: data.level || 1,
          rank: loadMore ? leaderboard.length + index + 1 : index + 1
        } as LeaderboardEntry;
      });

      if (loadMore) {
        setLeaderboard(prev => [...prev, ...users]);
      } else {
        setLeaderboard(users);
      }

      setHasMore(users.length === 20);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    fetchLeaderboard(true);
  };

  if (loading && leaderboard.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-green-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4">
            🏆 Planet Heroes Leaderboard
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">Top environmental champions from around the world!</p>
        </motion.div>

        {/* Podium Section */}
        {topThree.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center items-end space-x-2 sm:space-x-4 mb-6 sm:mb-8"
          >
            {/* 2nd Place */}
            <div className="text-center">
              <motion.div
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.5 }}
                className="w-16 sm:w-24 h-24 sm:h-32 bg-gradient-to-br from-gray-200 to-gray-400 rounded-t-xl flex items-end justify-center pb-2 sm:pb-4"
              >
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg mb-1 sm:mb-2 mx-auto">
                    {topThree[1].name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="text-white font-bold text-xs sm:text-sm">{topThree[1].name.split(' ')[0]}</div>
                  <div className="text-white/80 text-xs">{topThree[1].totalPoints} pts</div>
                </div>
              </motion.div>
              <div className="bg-gray-300 text-gray-700 py-1 sm:py-2 px-2 sm:px-4 rounded-b-xl font-bold text-xs sm:text-sm">2nd</div>
            </div>

            {/* 1st Place */}
            <div className="text-center">
              <motion.div
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-16 sm:w-24 h-28 sm:h-40 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-t-xl flex items-end justify-center pb-2 sm:pb-4"
              >
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg mb-1 sm:mb-2 mx-auto">
                    {topThree[0].name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="text-white font-bold text-xs sm:text-sm">{topThree[0].name.split(' ')[0]}</div>
                  <div className="text-white/80 text-xs">{topThree[0].totalPoints} pts</div>
                </div>
              </motion.div>
              <div className="bg-yellow-400 text-yellow-900 py-1 sm:py-2 px-2 sm:px-4 rounded-b-xl font-bold text-xs sm:text-sm">1st 👑</div>
            </div>

            {/* 3rd Place */}
            <div className="text-center">
              <motion.div
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.7 }}
                className="w-16 sm:w-24 h-20 sm:h-28 bg-gradient-to-br from-amber-600 to-orange-500 rounded-t-xl flex items-end justify-center pb-2 sm:pb-4"
              >
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg mb-1 sm:mb-2 mx-auto">
                    {topThree[2].name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="text-white font-bold text-xs sm:text-sm">{topThree[2].name.split(' ')[0]}</div>
                  <div className="text-white/80 text-xs">{topThree[2].totalPoints} pts</div>
                </div>
              </motion.div>
              <div className="bg-orange-400 text-orange-900 py-1 sm:py-2 px-2 sm:px-4 rounded-b-xl font-bold text-xs sm:text-sm">3rd</div>
            </div>
          </motion.div>
        )}

        {/* Full Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary to-secondary p-4 sm:p-6">
              <CardTitle className="text-primary-foreground">
                <h3 className="text-lg sm:text-xl font-bold mb-2">Global Rankings</h3>
                <p className="text-primary-foreground/80 text-sm sm:text-base">Real-time updates from Planet Heroes worldwide</p>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {remaining.map((entry, index) => {
                  const colors = [
                    "from-green-400 to-emerald-500",
                    "from-purple-400 to-pink-500", 
                    "from-red-400 to-pink-500",
                    "from-blue-400 to-cyan-500",
                    "from-yellow-400 to-orange-500"
                  ];
                  const colorClass = colors[index % colors.length];

                  return (
                    <motion.div
                      key={entry.userId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center justify-between p-4 sm:p-6 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground font-bold text-xs sm:text-sm">
                          {entry.rank}
                        </div>
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${colorClass} rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base`}>
                          {entry.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm sm:text-base">{entry.name}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mt-1">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-accent/10 text-accent-foreground">
                              <i className="fas fa-medal w-3 h-3 mr-1"></i>
                              {entry.badges.length} badges
                            </span>
                            <span className="text-xs text-muted-foreground mt-1 sm:mt-0">Level {entry.level}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground text-base sm:text-lg">{entry.totalPoints}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">points</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {hasMore && (
                <div className="p-4 sm:p-6 bg-muted/30 text-center">
                  <Button 
                    onClick={loadMore} 
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                    data-testid="button-load-more"
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Loading...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-refresh mr-2"></i>
                        Load More Heroes
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
