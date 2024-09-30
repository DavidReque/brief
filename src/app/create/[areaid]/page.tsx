import AreaDashboard from "@/components/AreaDashboard";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: {
    areaid: string;
  };
}

const Page = async ({ params }: PageProps) => {
  const { areaid } = params;

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) redirect("/");

  // Verificar si el usuario tiene acceso como ADMIN al área
  const isAdmin = await db.userArea.findFirst({
    where: {
      userId: user.id,
      role: "ADMIN",
      areaId: areaid, // Asegurar que sea admin de esta área específica
    },
  });

  if (!isAdmin) {
    redirect("/dashboard");
  }

  // Recuperar el área y los archivos asociados, junto con la información del usuario
  const area = await db.area.findFirst({
    where: {
      id: areaid,
    },
  });

  if (!area) {
    notFound();
  }

  return <AreaDashboard areaId={areaid} areaName={area.name} />;
};

export default Page;
