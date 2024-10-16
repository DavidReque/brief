import { NextResponse } from "next/server";
import AWS from "aws-sdk";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { db } from "@/db";
import { FileType } from "@prisma/client";

// Configuración de AWS S3
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Crea una instancia de S3
const s3 = new AWS.S3();

// Maneja las solicitudes POST para subir archivos
export async function POST(request: Request) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  // Verifica si el usuario está autenticado
  if (!user || !user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File; // Archivo a subir
  const areaId = formData.get("areaId") as string; // ID del área

  // Validaciones
  if (!areaId || typeof areaId !== "string") {
    return NextResponse.json({ message: "Invalid area ID" }, { status: 400 });
  }
  if (!file) {
    return NextResponse.json({ message: "File is required" }, { status: 400 });
  }

  try {
    // Verifica acceso al área
    const userArea = await db.userArea.findFirst({
      where: { userId: user.id, areaId: areaId },
    });

    if (!userArea) {
      return NextResponse.json(
        { message: "User does not have access to this area" },
        { status: 403 }
      );
    }

    // Prepara el archivo para la subida
    const fileContent = await file.arrayBuffer();
    const fileName = `${user.id}/${areaId}/${Date.now()}-${file.name}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME as string,
      Key: fileName,
      Body: Buffer.from(fileContent),
      ContentType: file.type,
    };

    // Sube el archivo a S3
    const uploadResult = await s3.upload(params).promise();

    // Guarda información del archivo en la base de datos
    const createdFile = await db.file.create({
      data: {
        key: fileName,
        name: file.name,
        userId: user.id,
        url: uploadResult.Location,
        uploadStatus: "SUCCESS",
        fileType: getFileType(file.name),
        areaId: areaId,
      },
    });

    return NextResponse.json({ fileId: createdFile.id }, { status: 200 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { message: "Error uploading file" },
      { status: 500 }
    );
  }
}

// Función para determinar el tipo de archivo
function getFileType(fileName: string): "PDF" | "WORD" | "EXCEL" | "IMAGE" {
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
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "bmp":
    case "svg":
      return FileType.IMAGE;
    default:
      throw new Error("Unsupported file type");
  }
}
