import React from "react";
import MaxWithWrapper from "./MaxWithWrapper";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import {
  getKindeServerSession,
  LoginLink,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRight } from "lucide-react";

const Navbar = async () => {
  // Obtén la sesión del servidor para verificar si el usuario está autenticado
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWithWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href="/" className="flex z-40 font-semibold">
            <span>Logo.</span>
          </Link>

          <div className="hidden items-center space-x-4 sm:flex">
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
              // Si no está autenticado, mostrar los botones de Login y Register
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
