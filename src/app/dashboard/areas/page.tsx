import AreaList from "@/components/AreaList";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

const Page = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect("/");
  }

  const isAdmin = !!(await db.userArea.findFirst({
    where: {
      userId: user.id,
      role: "ADMIN",
    },
  }));

  return <AreaList isAdmin={isAdmin} />;
};

export default Page;
