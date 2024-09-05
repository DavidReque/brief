"use client";

import { trpc } from "@/app/_trpc/client";
import UploadButton from "./UploadButton";
import { Download, Ghost, Loader2, Trash } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "./ui/button";
import { useState } from "react";
import SideBar from "./SideBar";

interface DashboardProps {
  isAdmin: boolean;
}

const Dashboard = ({ isAdmin }: DashboardProps) => {
  const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<
    string | null
  >(null);

  const utils = trpc.useUtils();

  const { data: files, isLoading } = trpc.getUserFiles.useQuery();

  const { mutate: deleteFile } = trpc.deleteFile.useMutation({
    onSuccess: () => {
      utils.getUserFiles.invalidate();
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
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mis archivos</h1>
            <UploadButton />
          </div>

          {files && files.length !== 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {files
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .map((file) => (
                  <div
                    key={file.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <Link
                      href={`/dashboard/${file.id}`}
                      className="block p-6 hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                        <div className="ml-4 flex-1">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {file.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {format(
                              new Date(file.createdAt),
                              "dd 'de' MMMM, yyyy",
                              { locale: es }
                            )}
                          </p>
                        </div>
                      </div>
                    </Link>
                    <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
                      <Link
                        href={file.url}
                        download
                        className="flex items-center text-sm text-gray-500"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        <span>Descargar</span>
                      </Link>
                      <Button
                        onClick={() => deleteFile({ id: file.id })}
                        size="sm"
                        variant="destructive"
                        className="px-2 py-1"
                      >
                        {currentlyDeletingFile === file.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} height={200} className="w-full" />
              ))}
            </div>
          ) : (
            <div className="text-center mt-16">
              <Ghost className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-xl font-medium text-gray-900">
                Muy vacío por aquí
              </h3>
              <p className="mt-1 text-gray-500">Carguemos un archivo</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
