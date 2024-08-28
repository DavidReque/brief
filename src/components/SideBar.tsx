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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";

const SideBar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
    <>
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`flex items-center justify-center py-4 hover:bg-gray-200`}
          onClick={() => isMobile && setIsOpen(false)}
        >
          <item.icon className="w-6 h-6 mr-2" />
          <span className="text-xs md:text-sm">{item.name}</span>
        </Link>
      ))}

      <LogoutLink className="flex items-center justify-center py-4 hover:bg-gray-200">
        <LogOut />
        <span className="ml-2 text-xs md:text-sm">Cerrar sesión</span>
      </LogoutLink>

      <div className="border-t border-gray-200 my-4"></div>

      <div className="overflow-y-auto">
        <h3 className="text-xs font-semibold px-4 mb-2">Mis Áreas</h3>
        {isLoading ? (
          <div className="text-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : userAreas && userAreas.length > 0 ? (
          userAreas.map((area) => (
            <Link
              key={area.id}
              href={`/dashboard/areas/${area.id}`}
              className={`flex items-center px-4 py-2 hover:bg-gray-200`}
              onClick={() => isMobile && setIsOpen(false)}
            >
              <Folder className="w-4 h-4 mr-2" />
              <span className="text-xs md:text-sm truncate">{area.name}</span>
            </Link>
          ))
        ) : (
          <div className="text-xs px-4">No hay áreas</div>
        )}
      </div>
    </>
  );

  return (
    <>
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-gray-100 rounded-md"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      )}
      <nav
        className={`${
          isMobile
            ? `fixed inset-y-0 left-0 transform ${
                isOpen ? "translate-x-0" : "-translate-x-full"
              } transition-transform duration-300 ease-in-out z-40`
            : "relative"
        } flex flex-col h-screen w-64 bg-gray-100 text-gray-700 overflow-y-auto`}
      >
        {sidebarContent}
      </nav>
    </>
  );
};

export default SideBar;
