"use client";

import { trpc } from "@/app/_trpc/client";
import UploadButton from "./UploadButton";
import {
  CalendarIcon,
  Download,
  Ghost,
  Loader2,
  Plus,
  Search,
  Trash,
} from "lucide-react";
import Skeleton from "react-loading-skeleton";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { useState } from "react";
import SideBar from "./SideBar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { es } from "date-fns/locale";

interface AreaDashboardProps {
  areaId: string;
  areaName: string;
  isAdmin: boolean;
  currentUserId: string;
}

// Definimos el enum FileType para que coincida con el modelo Prisma
enum FileType {
  PDF = "PDF",
  WORD = "WORD",
  EXCEL = "EXCEL",
}

const AreasDashboard = ({
  areaId,
  areaName,
  isAdmin,
  currentUserId,
}: AreaDashboardProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState<FileType | "">("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

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

  // Filtrado local actualizado
  const filteredFiles = files?.filter((file) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      file.name.toLowerCase().includes(query) ||
      file.uploadedBy.email.toLowerCase().includes(query); // Filtrar por nombre de usuario
    const matchesFileType = fileTypeFilter
      ? file.fileType === fileTypeFilter
      : true;
    const matchesDate = dateFilter
      ? format(new Date(file.createdAt), "yyyy-MM-dd") ===
        format(dateFilter, "yyyy-MM-dd")
      : true;

    return matchesSearch && matchesFileType && matchesDate;
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
                  format(dateFilter, "PPP")
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
            onValueChange={(value) => setFileTypeFilter(value as FileType | "")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tipo de archivo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos los tipos</SelectItem>
              <SelectItem value={FileType.PDF}>PDF</SelectItem>
              <SelectItem value={FileType.WORD}>Word</SelectItem>
              <SelectItem value={FileType.EXCEL}>Excel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mostrar archivos filtrados */}
        {isLoading ? (
          <Skeleton height={100} className="my-2" count={3} />
        ) : filteredFiles && filteredFiles.length > 0 ? (
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
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {file.name}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {file.uploadedBy.email}
                        </p>
                      </div>
                    </div>
                  </Link>

                  <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500">
                        {format(new Date(file.createdAt), "dd/MM/yyyy", {
                          locale: es,
                        })}
                      </p>
                    </div>

                    <Link
                      href={file.url}
                      download
                      className="flex items-center text-sm text-gray-500"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      <span>Descargar</span>
                    </Link>
                    {file.uploadedBy.id === currentUserId && (
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
                    )}
                  </div>
                </div>
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
      </main>
    </div>
  );
};

export default AreasDashboard;
