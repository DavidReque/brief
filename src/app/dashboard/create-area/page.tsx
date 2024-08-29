import CreateForm from "@/components/CreateForm";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

const Page = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const isAdmin = await db.userArea.findFirst({
    where: {
      userId: user.id,
      role: "ADMIN",
    },
  });

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return <CreateForm />;
};

export default Page;