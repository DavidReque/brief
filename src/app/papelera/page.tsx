import Dashboard from "@/components/Dashboard";
import Papelera from "@/components/Papelera";
import { db } from "@/db";
import { verifyOrCreateUser } from "@/lib/utils";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

const Page = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  // Redirige si el usuario no está autenticado
  if (!user || !user.id) redirect("/");

  try {
    // Verifica o crea el usuario en la base de datos
    await verifyOrCreateUser(user.id, user.email!);
  } catch (error) {
    console.error("Error verifying or creating user:", error);
  }

  // Verifica si el usuario tiene rol de ADMIN
  const adminArea = await db.userArea.findFirst({
    where: {
      userId: user?.id,
      role: "ADMIN",
    },
  });

  const isAdmin = !!adminArea; // Convert to boolean

  // Renderiza componente de Paplera
  return <Papelera isAdmin={isAdmin} />;
};

export default Page;
