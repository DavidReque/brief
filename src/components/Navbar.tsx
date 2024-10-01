import React from "react";
import MaxWithWrapper from "./MaxWithWrapper";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import {
  getKindeServerSession,
  LoginLink,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRight, Menu } from "lucide-react";

const Navbar = async () => {
  // Obtén la sesión del servidor para verificar si el usuario está autenticado
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <nav className="sticky top-0 z-30 w-full h-14 bg-white/75 backdrop-blur-lg border-b border-gray-200 transition-all">
      <MaxWithWrapper>
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex z-40 font-semibold">
            <span>Logo</span>
          </Link>

          {/* Menú para pantallas grandes */}
          <div className="hidden sm:flex items-center space-x-4">
            {user ? (
              <Link
                href="/dashboard"
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                })}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <LoginLink
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                >
                  Iniciar sesión
                </LoginLink>
                <RegisterLink
                  className={buttonVariants({
                    size: "sm",
                  })}
                >
                  Registrarse
                  <ArrowRight className="ml-1.5 h-5 w-5" />
                </RegisterLink>
              </>
            )}
          </div>

          {/* Menú para pantallas pequeñas */}
          <div className="block sm:hidden">
            {user ? (
              <Link
                href="/dashboard"
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                })}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <LoginLink
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                >
                  Iniciar sesión
                </LoginLink>
                <RegisterLink
                  className={buttonVariants({
                    size: "sm",
                  })}
                >
                  Registrarse
                  <ArrowRight className="ml-1.5 h-5 w-5" />
                </RegisterLink>
              </>
            )}
          </div>
        </div>
      </MaxWithWrapper>
    </nav>
  );
};

export default Navbar;
