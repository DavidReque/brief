"use client";

import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import Dropzone from "react-dropzone";
import { Cloud, File, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Progress } from "./ui/progress";
import { useToast } from "./ui/use-toast";
import { trpc } from "@/app/_trpc/client";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const UploadDropzone = () => {
  const router = useRouter();

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [acceptedFile, setAcceptedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const { data: areas } = trpc.getUserAreas.useQuery();

  const handleFileDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles[0]) {
      setAcceptedFile(acceptedFiles[0]);
    }
  }, []);

  const handleUpload = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!selectedArea) {
      toast({
        title: "Área no seleccionada",
        description:
          "Por favor, selecciona un área antes de cargar el archivo.",
        variant: "destructive",
      });
      return;
    }

    if (!acceptedFile) {
      toast({
        title: "Archivo no seleccionado",
        description:
          "Por favor, selecciona un archivo antes de iniciar la carga.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", acceptedFile);
    formData.append("areaId", selectedArea);

    try {
      const response = await axios.post("/api/upload", formData, {
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      if (response.status === 200) {
        toast({
          title: "Éxito",
          description: "Archivo cargado correctamente.",
        });
        // redirigir al usuario
        router.push(`/dashboard/${response.data.fileId}`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al cargar el archivo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-4">
      <div className="border h-48 border-dashed border-gray-300 rounded-lg overflow-hidden">
        <Dropzone multiple={false} onDrop={handleFileDrop}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()} className="h-full">
              <div className="flex items-center justify-center w-full h-full">
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Cloud className="h-6 w-6 text-zinc-500 mb-2" />
                    <p className="mb-2 text-sm text-zinc-700">
                      <span className="font-semibold">
                        Click para seleccionar
                      </span>{" "}
                      o arrastrar
                    </p>
                  </div>

                  {acceptedFile && (
                    <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                      <div className="px-3 py-2 h-full grid place-items-center">
                        <File className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="px-3 py-2 h-full text-sm truncate">
                        {acceptedFile.name}
                      </div>
                    </div>
                  )}

                  <input
                    {...getInputProps()}
                    type="file"
                    id="dropzone-file"
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </Dropzone>
      </div>

      <div className="w-full">
        <Select
          value={selectedArea}
          onValueChange={(value) => setSelectedArea(value)}
        >
          <SelectTrigger className="w-full bg-white border border-gray-300 rounded-md">
            <SelectValue placeholder="Seleccionar área" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Seleccionar área">Seleccionar área</SelectItem>
            {areas?.map((area) => (
              <SelectItem key={area.id} value={area.id}>
                {area.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {acceptedFile && selectedArea && (
        <Button
          onClick={handleUpload}
          className="w-full"
          disabled={isUploading}
        >
          {isUploading ? "Cargando..." : "Iniciar carga"}
        </Button>
      )}

      {isUploading && (
        <div className="w-full">
          <Progress
            indicatorColor={uploadProgress === 100 ? "bg-green-500" : ""}
            value={uploadProgress}
            className="h-1 w-full bg-zinc-200"
          />
          {uploadProgress === 100 && (
            <div className="flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Redirigiendo...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function UploadButton() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Dialog open={isOpen} onOpenChange={(v) => setIsOpen(v)}>
      <DialogTrigger onClick={() => setIsOpen(true)} asChild>
        <Button>Cargar archivo</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <UploadDropzone />
      </DialogContent>
    </Dialog>
  );
}
