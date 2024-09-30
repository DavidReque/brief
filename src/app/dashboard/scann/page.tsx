import Dashboard from "@/components/Dashboard";
import PDFGeneratorUploader from "@/components/PDFGeneratorUploader";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

const Page = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const adminArea = await db.userArea.findFirst({
    where: {
      userId: user?.id,
      role: "ADMIN",
    },
  });

  const isAdmin = !!adminArea; // Convert to boolean

  return <PDFGeneratorUploader isAdmin={isAdmin} />;
};

export default Page;
