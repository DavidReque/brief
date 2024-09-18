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
  User2,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import ScanButton from "./ScanButton";

interface DashboardProps {
  isAdmin: boolean;
}

const SideBar = ({ isAdmin }: DashboardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAreasOpen, setIsAreasOpen] = useState(true);

  const navItems = [{ name: "Inicio", icon: Home, href: "/dashboard" }];

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

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-5">
        <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
      </div>
      <div className="px-3 mb-4">
        <ScanButton />
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
              {isLoadingAreas ? (
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
      <div className="p-5 border-t border-gray-200">
        {isLoadingUser ? (
          <div className="text-center py-2">
            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
          </div>
        ) : userData ? (
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3">
              <User2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {userData.email}
              </p>
            </div>
          </div>
        ) : null}
        <LogoutLink className="flex items-center text-red-600 hover:text-red-800 transition-colors duration-200">
          <LogOut className="w-5 h-5 mr-3" />
          <span className="text-sm">Cerrar sesión</span>
        </LogoutLink>
      </div>
    </div>
  );

  return (
    <>
      <div
        className={`md:hidden fixed top-0 left-0 right-0 h-[75px] z-40 flex items-center px-4 bg-white`}
      >
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
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
