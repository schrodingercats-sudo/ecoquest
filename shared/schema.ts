import { z } from "zod";

// User role types
export const UserRole = z.enum(["student", "teacher"]);
export type UserRole = z.infer<typeof UserRole>;

// Badge types
export const BadgeType = z.enum([
  "waste_warrior",
  "water_saver", 
  "green_thumb",
  "eco_champion",
  "planet_protector",
  "carbon_crusher",
  "ocean_guardian",
  "climate_champion"
]);
export type BadgeType = z.infer<typeof BadgeType>;

// Game types
export const GameType = z.enum([
  "waste_sorting",
  "water_saver",
  "plant_tree",
  "energy_saver",
  "ocean_cleanup",
  "carbon_footprint"
]);
export type GameType = z.infer<typeof GameType>;

// User schema
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: UserRole,
  totalPoints: z.number().default(0),
  badges: z.array(BadgeType).default([]),
  level: z.number().default(1),
  createdAt: z.date(),
  lastActive: z.date()
});

export const insertUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  lastActive: true
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Game score schema
export const gameScoreSchema = z.object({
  id: z.string(),
  userId: z.string(),
  gameType: GameType,
  score: z.number(),
  completedAt: z.date(),
  badgeEarned: BadgeType.optional()
});

export const insertGameScoreSchema = gameScoreSchema.omit({
  id: true,
  completedAt: true
});

export type GameScore = z.infer<typeof gameScoreSchema>;
export type InsertGameScore = z.infer<typeof insertGameScoreSchema>;

// Leaderboard entry schema
export const leaderboardEntrySchema = z.object({
  userId: z.string(),
  name: z.string(),
  totalPoints: z.number(),
  badges: z.array(BadgeType),
  level: z.number(),
  rank: z.number()
});

export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;

// Eco fact schema
export const ecoFactSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  imageUrl: z.string().optional()
});

export type EcoFact = z.infer<typeof ecoFactSchema>;

// Teacher class analytics
export const classAnalyticsSchema = z.object({
  totalStudents: z.number(),
  averageScore: z.number(),
  totalBadges: z.number(),
  activeToday: z.number(),
  gameStats: z.record(GameType, z.object({
    totalPlays: z.number(),
    averageScore: z.number(),
    completionRate: z.number()
  }))
});

export type ClassAnalytics = z.infer<typeof classAnalyticsSchema>;
