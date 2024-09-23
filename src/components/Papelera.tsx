"use client";

import React, { useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { Button } from "./ui/button";
import SideBar from "./SideBar";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";
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

type PropsPapelera = {
  isAdmin: boolean;
};

const Papelera = ({ isAdmin }: PropsPapelera) => {
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleRestore = (id: string) => {
    setRestoringId(id);
    restoreFile({ id });
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    permanentlyDeleteFile({ id });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <SideBar isAdmin={isAdmin} />
      <div className="flex-1 p-10 mt-4">
        <h2 className="text-2xl font-bold mb-6">Papelera</h2>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : deletedFiles && deletedFiles.length > 0 ? (
          <div className="bg-white shadow rounded-lg">
            {deletedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 border-b last:border-b-0"
              >
                <span className="font-medium">{file.name}</span>
                <div className="space-x-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        className="bg-blue-500 hover:bg-blue-600"
                        disabled={restoringId === file.id}
                      >
                        {restoringId === file.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Restaurar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción restaurará el archivo {file.name}. ¿Deseas
                          continuar?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRestore(file.id)}
                        >
                          Restaurar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        className="bg-red-500 hover:bg-red-600"
                        disabled={deletingId === file.id}
                      >
                        {deletingId === file.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
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
          <div className="flex flex-col items-center justify-center h-64">
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
