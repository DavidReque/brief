import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const getFileType = (fileName: string): "PDF" | "WORD" | "EXCEL" => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "pdf":
      return "PDF";
    case "doc":
    case "docx":
      return "WORD";
    case "xls":
    case "xlsx":
      return "EXCEL";
    default:
      throw new Error("Unsupported file type");
  }
};

export const ourFileRouter = {
  fileUploader: f({
    pdf: {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
    blob: {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const { getUser } = getKindeServerSession();
      const user = await getUser();

      if (!user || !user.id) throw new Error("Unauthorized");

      const userArea = await db.userArea.findFirst({
        where: {
          userId: user.id,
        },
        select: {
          areaId: true,
        },
      });

      if (!userArea || !userArea.areaId) throw new Error("Area ID is required");

      return { userId: user.id, areaId: userArea.areaId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const fileType = getFileType(file.name);

      // Verificar si el tipo de archivo es permitido
      if (!["PDF", "WORD", "EXCEL"].includes(fileType)) {
        throw new Error("Unsupported file type");
      }

      const createdFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          url: file.url,
          uploadStatus: "PROCESSING",
          fileType,
          areaId: metadata.areaId,
        },
      });
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
