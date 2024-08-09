"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../_trpc/client";
import { useEffect } from "react";

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");

  const { data, error, isLoading } = trpc.authCallback.useQuery();

  useEffect(() => {
    if (data?.success) {
      // Manejar el éxito aquí
      router.push(origin ? `/${origin}` : "/dashboard");
    }
  }, [data, router, origin]);

  if (isLoading) {
    return <div>Verificando autenticación...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return <div>Redirigiendo...</div>;
};

export default Page;
