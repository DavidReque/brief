import AreaDashboard from "@/components/AreaDashboard";
import AreasDashboard from "@/components/AreasDashboard";
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

  if (!user) {
    redirect("/login");
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

  return <AreasDashboard areaId={areaid} areaName={area.name} />;
};

export default Page;