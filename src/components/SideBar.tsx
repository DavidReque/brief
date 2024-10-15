"use client";

import React, { useState, useEffect } from "react";
import { trpc } from "@/app/_trpc/client";
import {
  Folder,
  Home,
  Loader2,
  Menu,
  X,
  LogOut,
  Plus,
  ChevronDown,
  AreaChart,
  User2,
  Trash,
  SaveAll,
} from "lucide-react";
import Link from "next/link";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import ScanButton from "./ScanButton";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DashboardProps {
  isAdmin: boolean;
}

interface NavItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

interface Area {
  id: string;
  name: string;
}

interface User {
  email: string;
}

const SideBar: React.FC<DashboardProps> = ({ isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAreasOpen, setIsAreasOpen] = useState(true);

  const navItems: NavItem[] = [
    { name: "Inicio", icon: Home, href: "/dashboard" },
    { name: "Guardado", icon: SaveAll, href: "/saved" },
    { name: "Papelera", icon: Trash, href: "/papelera" },
  ];

  const { data: userAreas, isLoading: isLoadingAreas } =
    trpc.getUserAreas.useQuery();
  const { data: userData, isLoading: isLoadingUser } =
    trpc.getCurrentUser.useQuery();

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const truncateEmail = (email: string | null): string => {
    if (!email) return "No email provided";
    if (email.length > 20) {
      return `${email.substring(0, 20)}...`;
    }
    return email;
  };

  const NavItemComponent: React.FC<{ item: NavItem; onClick: () => void }> = ({
    item,
    onClick,
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-colors duration-200"
            onClick={onClick}
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span className="text-sm font-medium">{item.name}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{item.name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
      <div className="p-5 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
      </div>
      <div className="px-4 py-4">
        <ScanButton />
      </div>
      <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItemComponent
            key={item.name}
            item={item}
            onClick={() => isMobile && setIsOpen(false)}
          />
        ))}

        {isAdmin && (
          <NavItemComponent
            item={{ name: "Crear Área", icon: Plus, href: "/create" }}
            onClick={() => isMobile && setIsOpen(false)}
          />
        )}

        <NavItemComponent
          item={{ name: "Áreas", icon: AreaChart, href: "/dashboard/areas" }}
          onClick={() => isMobile && setIsOpen(false)}
        />

        <div className="mt-4">
          <Button
            variant="ghost"
            onClick={() => setIsAreasOpen(!isAreasOpen)}
            className="flex items-center justify-between w-full text-left text-gray-700 hover:text-blue-600 hover:bg-gray-100"
          >
            <span className="text-sm font-medium">Mis Áreas</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isAreasOpen ? "transform rotate-180" : ""
              }`}
            />
          </Button>
          {isAreasOpen && (
            <div className="mt-2 space-y-1">
              {isLoadingAreas ? (
                <div className="text-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                </div>
              ) : userAreas && userAreas.length > 0 ? (
                userAreas.map((area) => (
                  <NavItemComponent
                    key={area.id}
                    item={{
                      name: area.name,
                      icon: Folder,
                      href: `/dashboard/areas/${area.id}`,
                    }}
                    onClick={() => isMobile && setIsOpen(false)}
                  />
                ))
              ) : (
                <div className="text-sm text-gray-500 pl-8 py-2">
                  No hay áreas
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
      <div className="p-4 border-t border-gray-200">
        {isLoadingUser ? (
          <div className="text-center py-2">
            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
          </div>
        ) : userData ? (
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
              <User2 className="w-6 h-6 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {truncateEmail(userData.email)}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{userData.email}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        ) : null}
        <LogoutLink className="flex items-center text-red-600 hover:text-red-800 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors duration-200">
          <LogOut className="w-5 h-5 mr-3" />
          <span className="text-sm font-medium">Cerrar sesión</span>
        </LogoutLink>
      </div>
    </div>
  );

  return (
    <>
      <div
        className={`md:hidden fixed top-0 left-0 right-0 h-[7]150px] z-40 flex items-center px-4`}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>
      {isMobile && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-40 ${
            isOpen ? "block" : "hidden"
          }`}
          onClick={toggleSidebar}
        ></div>
      )}
      <aside
        className={`${
          isMobile
            ? `fixed inset-y-0 left-0 transform ${
                isOpen ? "translate-x-0" : "-translate-x-full"
              } transition-transform duration-300 ease-in-out z-50`
            : "relative"
        } w-64 bg-white border-r border-gray-200 shadow-lg h-full overflow-hidden`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default SideBar;
