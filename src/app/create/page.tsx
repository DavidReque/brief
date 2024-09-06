import CreateForm from "@/components/CreateForm";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

const Page = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) redirect("/auth-callback?origin=dashboard");

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });

  if (!dbUser) redirect("/auth-callback?origin=dashboard");

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
