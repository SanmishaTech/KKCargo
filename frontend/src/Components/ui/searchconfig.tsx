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
  Truck,
  Shield,
  Key,
  Settings
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
      title: "Staff",
      url: "/staff",
      icon: Users,
    },
    {
      title: "Company",
      url: "/company",
      icon: Building,
    },
    {
      title: "Today Follow-up",
      url: "/today-followup",
      icon: Calendar,
    },
    {
      title: "Roles & Permissions",
      icon: Shield,
      children: [
        {
          title: "Roles",
          url: "/roles",
          icon: Users,
        },
        {
          title: "Permissions",
          url: "/permissions",
          icon: Key,
        },
      ],
    },
    {
      title: "Activity Log",
      url: "/activity-log",
      icon: FileText,
    },
    {
      title: "2FA Settings",
      url: "/settings",
      icon: Settings,
    },
  ],
  staff: [
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
    {
      title: "Today Follow-up",
      url: "/today-followup",
      icon: Calendar,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ],
   
};
