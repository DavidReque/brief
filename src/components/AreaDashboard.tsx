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
}

const AreaDashboard = ({ areaId, areaName }: AreaDashboardProps) => {
  const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<
    string | null
  >(null);

  const utils = trpc.useUtils();

  // Query para obtener los archivos de un área específica
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
    <div className="flex">
      <SideBar isAdmin />
      <main className="flex-1 mx-auto max-w-7xl p-4 md:p-10">
        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
          <h1 className="mb-3 font-bold text-5xl text-gray-900">{areaName}</h1>
          <div className="flex items-center gap-4">
            <UploadButton />
          </div>
        </div>

        {/* Mostrar todos los archivos del área */}
        {isLoading ? (
          <Skeleton height={100} className="my-2" count={3} />
        ) : files && files.length > 0 ? (
          <ul className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3">
            {files
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map((file) => (
                <li
                  key={file.id}
                  className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg"
                >
                  <Link
                    href={`/dashboard/${file.id}`}
                    className="flex flex-col gap-2"
                  >
                    <div className="pt-6 px-6 flex w-full items-center justify-between space-x-6">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                      <div className="flex-1 truncate">
                        <div className="flex items-center space-x-3">
                          <h3 className="truncate text-lg font-medium text-zinc-900">
                            {file.name}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500">
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      {format(new Date(file.createdAt), "MMM yyyy")}
                    </div>

                    <div className="flex items-center gap-2 col-span-2 justify-between">
                      <User className="h-4 w-4" />
                      <span className="truncate">{file.uploadedBy.email}</span>
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
                    </div>
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

export default AreaDashboard;
