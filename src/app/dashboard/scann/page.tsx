import Dashboard from "@/components/Dashboard";
import PDFGeneratorUploader from "@/components/PDFGeneratorUploader";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

const Page = async () => {
  // Obtiene el usuario de la sesión
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  // Verifica si el usuario tiene rol de ADMIN
  const adminArea = await db.userArea.findFirst({
    where: {
      userId: user?.id,
      role: "ADMIN",
    },
  });

  const isAdmin = !!adminArea; // Convert to boolean

  // Renderiza el componente PDFGeneratorUploader, pasando el estado de admin
  return <PDFGeneratorUploader isAdmin={isAdmin} />;
};

export default Page;
