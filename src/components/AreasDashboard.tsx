"use client";

import { trpc } from "@/app/_trpc/client";
import UploadButton from "./UploadButton";
import { Ghost, Loader2, Plus, Trash, User } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { useState } from "react";
import SideBar from "./SideBar";

interface AreaDashboardProps {
  areaId: string;
  areaName: string;
  isAdmin: boolean;
  currentUserId: string;
}

const AreasDashboard = ({
  areaId,
  areaName,
  isAdmin,
  currentUserId,
}: AreaDashboardProps) => {
  const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<
    string | null
  >(null);

  const utils = trpc.useUtils();

  const { data: files, isLoading } = trpc.getAreaFiles.useQuery({ areaId });

  const { mutate: deleteFile } = trpc.deleteFile.useMutation({
    onSuccess: () => {
      utils.getAreaFiles.invalidate({ areaId });
    },
    onMutate({ id }) {
      setCurrentlyDeletingFile(id);
    },
    onSettled() {
      setCurrentlyDeletingFile(null);
    },
  });

  return (
    <div className="flex h-screen bg-gray-100">
      <SideBar isAdmin={isAdmin} />
      <main className="flex-1 mx-auto max-w-7xl p-4 md:p-10">
        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
          <h1 className="mb-3 font-bold text-5xl text-gray-900">{areaName}</h1>
          <div className="flex items-center gap-4">
            <UploadButton />
          </div>
        </div>

        {isLoading ? (
          <Skeleton height={100} className="my-2" count={3} />
        ) : files && files.length > 0 ? (
          <ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {files
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map((file) => (
                <li
                  key={file.id}
                  className="col-span-1 bg-white rounded-lg shadow transition hover:shadow-lg overflow-hidden"
                >
                  <Link href={`/dashboard/${file.id}`} className="block p-6">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {file.uploadedBy.email}
                        </p>
                      </div>
                    </div>
                  </Link>

                  <div className="px-6 py-4 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      {format(new Date(file.createdAt), "dd/MM/yy")}
                    </div>

                    {file.uploadedBy.id === currentUserId && (
                      <Button
                        onClick={() => deleteFile({ id: file.id })}
                        size="sm"
                        variant="destructive"
                      >
                        {currentlyDeletingFile === file.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        ) : (
          <div className="mt-16 flex flex-col items-center gap-2">
            <Ghost className="h-8 w-8 text-zinc-800" />
            <h3 className="font-semibold text-xl">Muy vacío por aquí</h3>
            <p>Carguemos un archivo</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AreasDashboard;
