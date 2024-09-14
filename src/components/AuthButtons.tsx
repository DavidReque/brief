"use client";

import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "./ui/button";

export const AuthButtons = () => (
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
);
