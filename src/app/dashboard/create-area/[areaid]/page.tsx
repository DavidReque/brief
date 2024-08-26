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

  const isAdmin = await db.userArea.findFirst({
    where: {
      userId: user.id,
      role: "ADMIN",
    },
  });

  if (!isAdmin) {
    redirect("/dashboard");
  }

  const area = await db.area.findFirst({
    where: {
      id: areaid,
    },
  });

  if (!area) {
    notFound();
  }

  return (
    <div>
      <h1>{area.name}</h1>
      <h2>{area.description}</h2>
    </div>
  );
};

export default Page;
