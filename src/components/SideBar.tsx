"use client";

import { trpc } from "@/app/_trpc/client";
import {
  Folder,
  Home,
  Loader2,
  Settings,
  User,
  Menu,
  X,
  LogOut,
  Plus,
  ChevronDown,
  AreaChart,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";

interface DashboardProps {
  isAdmin: boolean;
}

const SideBar = ({ isAdmin }: DashboardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAreasOpen, setIsAreasOpen] = useState(true);

  const navItems = [
    { name: "Inicio", icon: Home, href: "/dashboard" },
    { name: "Perfil", icon: User, href: "/dashboard/profile" },
    { name: "Configuración", icon: Settings, href: "/dashboard/settings" },
  ];

  const { data: userAreas, isLoading } = trpc.getUserAreas.useQuery();

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-5">
        <h2 className="text-xl font-bold text-gray-800">Mi Dashboard</h2>
      </div>
      <nav className="flex-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center px-5 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
            onClick={() => isMobile && setIsOpen(false)}
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span className="text-sm">{item.name}</span>
          </Link>
        ))}

        {isAdmin && (
          <Link
            className="flex items-center px-5 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
            href="/create"
          >
            <Plus className="w-5 h-5 mr-3" />
            <span className="text-sm">Crear Área</span>
          </Link>
        )}

        <Link
          className="flex items-center px-5 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
          href="/dashboard/areas"
        >
          <AreaChart className="w-5 h-5 mr-3" />
          <span className="text-sm">Areas</span>
        </Link>

        <div className="mt-4 px-5">
          <button
            onClick={() => setIsAreasOpen(!isAreasOpen)}
            className="flex items-center justify-between w-full text-left text-gray-600 hover:text-gray-900"
          >
            <span className="text-sm font-medium">Mis Áreas</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isAreasOpen ? "transform rotate-180" : ""
              }`}
            />
          </button>
          {isAreasOpen && (
            <div className="mt-2 space-y-1">
              {isLoading ? (
                <div className="text-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                </div>
              ) : userAreas && userAreas.length > 0 ? (
                userAreas.map((area) => (
                  <Link
                    key={area.id}
                    href={`/dashboard/areas/${area.id}`}
                    className="flex items-center pl-8 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                    onClick={() => isMobile && setIsOpen(false)}
                  >
                    <Folder className="w-4 h-4 mr-3" />
                    <span className="truncate">{area.name}</span>
                  </Link>
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
      <div className="p-5">
        <LogoutLink className="flex items-center text-red-600 hover:text-red-800 transition-colors duration-200">
          <LogOut className="w-5 h-5 mr-3" />
          <span className="text-sm">Cerrar sesión</span>
        </LogoutLink>
      </div>
    </div>
  );

  return (
    <>
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      )}
      <aside
        className={`${
          isMobile
            ? `fixed inset-y-0 left-0 transform ${
                isOpen ? "translate-x-0" : "-translate-x-full"
              } transition-transform duration-300 ease-in-out z-40`
            : "relative"
        } w-64 bg-white border-r border-gray-200 shadow-lg`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default SideBar;
