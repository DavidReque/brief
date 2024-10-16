import { db } from "@/db";
import { type ClassValue, clsx } from "clsx";
import { Metadata } from "next";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  if (typeof window !== "undefined") return path;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}${path}`;
  return `http://localhost:${process.env.PORT ?? 3000}${path}`;
}

export function constructMetadata({
  title = "Gestion de archivos",
  description = "La manera mas facil de proteger y guardar archivos",
  image = "/thumbnail.png",
  icons = "/favicon.ico",
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@",
    },
    icons,
    metadataBase: new URL("https://gestion-phi.vercel.app/"),
    themeColor: "#FFF",
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}

// Verifica si ya existe un usuario, si no existe lo crea
export async function verifyOrCreateUser(userId: string, email: string) {
  try {
    const user = await db.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: email,
      },
    });
    return user;
  } catch (error) {
    console.error("Error verifying or creating user:", error);
    throw error;
  }
}
