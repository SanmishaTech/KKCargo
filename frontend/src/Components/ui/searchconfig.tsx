import {
  Calendar,
  Home,
  Building,
  BookText,
  BookOpen,
  Users,
  MessageCircle,
  UserCheck,
  Package,
  FileText,
  User,
  MapPin,
  BookMarked,
  Banknote,
  UsersRound,
  Landmark,
  GraduationCap,
  Grid,
  LogOut,
  Truck
} from "lucide-react";

// Define the MenuItem interface (similar to sidebar)
export interface MenuItem {
  title: string;
  url?: string;
  children?: MenuItem[];
  icon?: React.ElementType;
}

// Define role-based navigation items matching the sidebar structure
export const searchconfig: Record<string, MenuItem[]> = {
  
  
  admin: [
    {
      title: "Dashboard",
      url: "/dashboards",
      icon: Home,
    },
    {
      title: "Staff",
      url: "/staff",
      icon: Users,
    },
    {
      title: "Company",
      url: "/company",
      icon: Building,
    },
  ],
  staff: [
    {
      title: "Dashboard",
      url: "/dashboards",
      icon: Home,
    },
    {
      title: "Staff",
      url: "/staff",
      icon: Users,
    },
    {
      title: "Company",
      url: "/company",
      icon: Building,
    },
  ],
   
};
