"use client";

import { trpc } from "@/app/_trpc/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const AuthCallbackHandler = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");

  const { data, error } = trpc.authCallback.useQuery(undefined, {
    retry: true,
    retryDelay: 500,
  });

  useEffect(() => {
    if (data?.success) {
      // Redirigir cuando el usuario se sincroniza con la base de datos
      router.push(origin ? `/${origin}` : "/dashboard");
    }
  }, [data, router, origin]);

  useEffect(() => {
    if (error?.data?.code === "UNAUTHORIZED") {
      // Redirigir si hay error de autenticación
      router.push("/");
    }
  }, [error, router]);

  return null;
};

export default AuthCallbackHandler;
