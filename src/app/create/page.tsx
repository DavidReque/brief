import CreateForm from "@/components/CreateForm";
import { db } from "@/db";
import { verifyOrCreateUser } from "@/lib/utils";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

const Page = async () => {
  // TODO: no mostrar usuario admin para eliminar al editar area
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) redirect("/");

  try {
    await verifyOrCreateUser(user.id, user.email!);
  } catch (error) {
    console.error("Error verifying or creating user:", error);
  }

  const isAdmin = !!(await db.userArea.findFirst({
    where: {
      userId: user.id,
      role: "ADMIN",
    },
  }));

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return <CreateForm isAdmin={isAdmin} />;
};

export default Page;
