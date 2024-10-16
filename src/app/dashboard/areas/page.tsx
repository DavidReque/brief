import AreaList from "@/components/AreaList";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

const Page = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  // Redirige si el usuario no está autenticado
  if (!user) {
    redirect("/");
  }

  // Verifica si el usuario tiene rol de ADMIN
  const isAdmin = !!(await db.userArea.findFirst({
    where: {
      userId: user.id,
      role: "ADMIN",
    },
  }));

  // Renderiza componente de las Areas
  return <AreaList isAdmin={isAdmin} />;
};

export default Page;
