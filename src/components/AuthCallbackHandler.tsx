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
      // Usar window.location.origin para obtener la URL base correcta
      const baseUrl = window.location.origin;
      const redirectUrl = origin
        ? `${baseUrl}/${origin}`
        : `${baseUrl}/dashboard`;
      window.location.href = redirectUrl;
    }
  }, [data, origin]);

  useEffect(() => {
    if (error?.data?.code === "UNAUTHORIZED") {
      // Usar window.location.origin para obtener la URL base correcta
      const baseUrl = window.location.origin;
      window.location.href = `${baseUrl}/sign-in`;
    }
  }, [error]);

  return null;
};

export default AuthCallbackHandler;
