import ChatWrapper from "@/components/ChatWrapper";
import FileRenderer from "@/components/FileRenderer";
import SideBar from "@/components/SideBar";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: {
    fileid: string;
  };
}

const Page = async ({ params }: PageProps) => {
  const { fileid } = params;

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) redirect(`/auth-callback?origin=dashboard/${fileid}`);

  const adminArea = await db.userArea.findFirst({
    where: {
      userId: user?.id,
      role: "ADMIN",
    },
  });

  const isAdmin = !!adminArea;

  const file = await db.file.findFirst({
    where: {
      id: fileid,
      area: {
        users: {
          some: {
            userId: user.id,
          },
        },
      },
    },
  });

  if (!file) notFound();

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex flex-row h-full">
        {/* Sidebar */}
        <SideBar isAdmin={isAdmin} />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-col lg:flex-row h-full">
            {/* Main area */}
            <div className="flex-1 p-6 overflow-auto">
              <FileRenderer url={file.url} fileType={file.fileType} />
            </div>

            {/* <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-gray-200">
              <ChatWrapper />
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
