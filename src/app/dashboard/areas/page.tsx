import AreaList from "@/components/AreaList";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

const Page = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const isAdmin = !!(await db.userArea.findFirst({
    where: {
      userId: user.id,
      role: "ADMIN",
    },
  }));

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Áreas y Archivos</h1>
      <AreaList isAdmin={isAdmin} />
    </div>
  );
};

export default Page;
