"use client";

import React from "react";
import { trpc } from "@/app/_trpc/client";
import {
  Download,
  Ghost,
  Trash2,
  Search,
  Calendar as CalendarIcon,
  FileType,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import SideBar from "@/components/SideBar";
import Skeleton from "react-loading-skeleton";

interface SavedFilesProps {
  isAdmin: boolean;
}

const SavedFiles = ({ isAdmin }: SavedFilesProps) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [fileTypeFilter, setFileTypeFilter] = React.useState("ALL");
  const [dateFilter, setDateFilter] = React.useState<Date | undefined>(
    undefined
  );
  const [currentlyDeletingFile, setCurrentlyDeletingFile] = React.useState<
    string | null
  >(null);

  const {
    data: savedFiles,
    refetch,
    isLoading,
  } = trpc.getSavedFiles.useQuery();
  const removeSavedFile = trpc.removeSavedFile.useMutation({
    onSuccess: () => refetch(),
  });

  const handleRemove = (fileId: string) => {
    setCurrentlyDeletingFile(fileId);
    removeSavedFile.mutate(
      { fileId },
      {
        onSettled: () => {
          setCurrentlyDeletingFile(null);
        },
      }
    );
  };
  const filteredFiles = savedFiles?.filter((file) => {
    const matchesSearch = file.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFileType =
      fileTypeFilter === "ALL" || file.fileType === fileTypeFilter;
    const matchesDate = dateFilter
      ? format(new Date(file.createdAt), "yyyy-MM-dd") ===
        format(dateFilter, "yyyy-MM-dd")
      : true;

    return matchesSearch && matchesFileType && matchesDate;
  });

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <SideBar isAdmin={isAdmin} />
      <main className="flex-1 overflow-y-auto p-8 mt-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="mb-3 font-bold text-5xl text-gray-900">
              Mis archivos guardados
            </h1>
          </div>

          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por nombre"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter ? (
                    format(dateFilter, "PPP", { locale: es })
                  ) : (
                    <span>Seleccionar fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateFilter}
                  onSelect={setDateFilter}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Select
              value={fileTypeFilter}
              onValueChange={(value) => setFileTypeFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de archivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los tipos</SelectItem>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="WORD">Word</SelectItem>
                <SelectItem value="EXCEL">Excel</SelectItem>
                <SelectItem value="IMAGE">Imagen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="ml-4 space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-gray-50">
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredFiles && filteredFiles.length !== 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFiles
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .map((file) => (
                  <div
                    key={file.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
                  >
                    <Link
                      href={`/dashboard/${file.id}`}
                      className="block p-6 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center" />
                        <div className="ml-4 flex-1 min-w-0">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                  {file.name}
                                </h3>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{file.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <p className="text-sm text-gray-500">
                            {format(new Date(file.createdAt), "dd/MM/yyyy", {
                              locale: es,
                            })}
                          </p>
                        </div>
                      </div>
                    </Link>
                    <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
                      <Link
                        href={file.url}
                        download
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        <span className="truncate max-w-[100px]">
                          Descargar
                        </span>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-800 hover:bg-red-100 transition-colors duration-200"
                            disabled={currentlyDeletingFile === file.id}
                          >
                            {currentlyDeletingFile === file.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" /> // Mostrar spinner
                            ) : (
                              <Trash2 className="h-4 w-4" /> // Ícono de eliminar por defecto
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará
                              permanentemente el archivo de tus archivos
                              guardados.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemove(file.id)}
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
            <div className="text-center mt-16">
              <Ghost className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-xl font-medium text-gray-900">
                No hay archivos guardados
              </h3>
              <p className="mt-1 text-gray-500">
                Guarda algunos archivos para verlos aquí
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SavedFiles;
