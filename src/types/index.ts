/**
 * Platform Pertanian Padi Desa Cirebon Girang
 * Tipe Data dan Definisi Antarmuka Utama
 */

export type UserRole = "ADMIN" | "VILLAGE_OFFICER" | "FARMER";

export interface UserSession {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  phone?: string | null;
  email?: string | null;
}

export type IrrigationType = "TECHNICAL" | "SEMI_TECHNICAL" | "RAINFED";
export type OwnershipStatus = "OWNED" | "RENTED" | "SHARECROPPING";
export type CropStage =
  | "LAND_PREPARATION"
  | "SEEDING"
  | "VEGETATIVE"
  | "GENERATIVE"
  | "HARVESTING"
  | "COMPLETED"
  | "FAILED";

export type ActivityCategory =
  | "LAND_PREPARATION"
  | "SEEDING"
  | "PLANTING"
  | "IRRIGATION"
  | "FERTILIZATION"
  | "PEST_CONTROL"
  | "HARVESTING"
  | "POST_HARVEST";

export interface SystemOverviewStats {
  totalFarmers: number;
  totalFarmerGroups: number;
  totalFarmlandAreaHectares: number;
  activePlantingSeasons: number;
  activeCropCycles: number;
  databaseStatus: "CONNECTED" | "ERROR";
  systemVersion: string;
  timestamp: string;
}

export interface RoleNavigationItem {
  title: string;
  description: string;
  role: UserRole;
  badge: string;
  features: string[];
}
