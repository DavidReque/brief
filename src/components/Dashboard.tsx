"use client";

import { useState } from "react";
import { trpc } from "@/app/_trpc/client";
import UploadButton from "./UploadButton";
import {
  Download,
  Ghost,
  Loader2,
  Trash,
  Search,
  Calendar as CalendarIcon,
} from "lucide-react";
import Skeleton from "react-loading-skeleton";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "./ui/button";
import SideBar from "./SideBar";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import ScanButton from "./ScanButton";

interface DashboardProps {
  isAdmin: boolean;
}

// Definimos el enum FileType para que coincida con el modelo Prisma
enum FileType {
  PDF = "PDF",
  WORD = "WORD",
  EXCEL = "EXCEL",
  IMAGE = "IMAGE",
}

const Dashboard = ({ isAdmin }: DashboardProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState<FileType | "ALL">("ALL");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

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

  // Filtrado local actualizado
  const filteredFiles = files?.filter((file) => {
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
              Mis archivos
            </h1>
            <UploadButton />
          </div>

          <ScanButton />

          {/* Filtros */}
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
              onValueChange={(value) =>
                setFileTypeFilter(value as FileType | "ALL")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de archivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los tipos</SelectItem>
                <SelectItem value={FileType.PDF}>PDF</SelectItem>
                <SelectItem value={FileType.WORD}>Word</SelectItem>
                <SelectItem value={FileType.EXCEL}>Excel</SelectItem>
                <SelectItem value={FileType.IMAGE}>Imagen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mostrar archivos filtrados */}
          {filteredFiles && filteredFiles.length !== 0 ? (
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
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <Link
                      href={`/dashboard/${file.id}`}
                      className="block p-6 hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                        <div className="ml-4 flex-1 min-w-0">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <h3 className="text-lg font-medium text-gray-900 truncate">
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
                        className="flex items-center text-sm text-gray-500"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        <span className="truncate max-w-[100px]">
                          Descargar
                        </span>
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
