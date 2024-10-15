"use client";

import React, { useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { Button } from "./ui/button";
import SideBar from "./SideBar";
import { RefreshCw, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Skeleton from "react-loading-skeleton";

type PropsPapelera = {
  isAdmin: boolean;
};

const Papelera = ({ isAdmin }: PropsPapelera) => {
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const {
    data: deletedFiles,
    refetch,
    isLoading,
  } = trpc.getDeletedFiles.useQuery();

  const { mutate: restoreFile } = trpc.restoreFile.useMutation({
    onSuccess: () => {
      refetch();
      setRestoringId(null);
    },
  });

  const { mutate: permanentlyDeleteFile } =
    trpc.permanentlyDeleteFile.useMutation({
      onSuccess: () => {
        refetch();
        setDeletingId(null);
      },
    });

  const { mutate: deleteAllFiles } = trpc.deleteAllFiles.useMutation({
    onSuccess: () => {
      refetch();
      setIsDeletingAll(false);
    },
  });

  const handleRestore = (id: string) => {
    setRestoringId(id);
    restoreFile({ id });
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    permanentlyDeleteFile({ id });
  };

  const handleDeleteAll = () => {
    setIsDeletingAll(true);
    deleteAllFiles();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <SideBar isAdmin={isAdmin} />
      <div className="flex-1 p-10 mt-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="mb-3 font-bold text-5xl text-gray-900">Papelera</h1>{" "}
          {deletedFiles && deletedFiles.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="bg-red-500 hover:bg-red-600"
                  disabled={isDeletingAll}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar todo
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará permanentemente todos los archivos de
                    la papelera. Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAll}>
                    Eliminar todo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-white shadow rounded-lg"
              >
                <Skeleton height={20} width="30%" />
                <div className="flex space-x-2">
                  <Skeleton height={36} width={100} />
                  <Skeleton height={36} width={150} />
                </div>
              </div>
            ))}
          </div>
        ) : deletedFiles && deletedFiles.length > 0 ? (
          <div className="space-y-4">
            {deletedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 bg-white shadow rounded-lg transition-all hover:shadow-md"
              >
                <span className="font-medium mb-2 sm:mb-0">{file.name}</span>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button
                    variant="outline"
                    className="border-blue-500 text-blue-500 hover:bg-blue-50"
                    disabled={restoringId === file.id}
                    onClick={() => handleRestore(file.id)}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restaurar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="bg-red-500 hover:bg-red-600"
                        disabled={deletingId === file.id}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar permanentemente
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción eliminará permanentemente el archivo{" "}
                          {file.name}. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(file.id)}
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-white shadow rounded-lg">
            <Trash2 className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-xl font-medium text-gray-600">
              La papelera está vacía
            </p>
            <p className="text-gray-500 mt-2">
              No hay archivos eliminados para mostrar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Papelera;
