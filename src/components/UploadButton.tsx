"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ui/use-toast";
import { trpc } from "@/app/_trpc/client";
import axios from "axios";
import { Progress } from "./ui/progress";
import { Cloud, File, Loader2, Upload } from "lucide-react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import Dropzone from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";

const UploadDropzone = ({ onClose }: { onClose: () => void }) => {
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

  const handleUpload = async () => {
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
        onClose();
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
    <Card>
      <CardHeader>
        <CardTitle>Cargar archivo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Dropzone onDrop={handleFileDrop} multiple={false}>
          {({ getRootProps, getInputProps }) => (
            <div
              {...getRootProps()}
              className="border-dashed border-2 border-gray-300 p-6 text-center cursor-pointer rounded-md hover:bg-gray-50 transition-colors"
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Arrastra un archivo aquí o haz clic para seleccionarlo.
              </p>
              {acceptedFile && (
                <div className="mt-2 text-sm text-gray-600">
                  Archivo seleccionado: {acceptedFile.name}
                </div>
              )}
            </div>
          )}
        </Dropzone>

        <Select onValueChange={(value) => setSelectedArea(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar área" />
          </SelectTrigger>
          <SelectContent>
            {areas?.map((area) => (
              <SelectItem key={area.id} value={area.id}>
                {area.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={handleUpload}
          className="w-full"
          disabled={isUploading || !acceptedFile || !selectedArea}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando...
            </>
          ) : (
            <>
              <Cloud className="mr-2 h-4 w-4" /> Iniciar carga
            </>
          )}
        </Button>

        {isUploading && (
          <div className="w-full">
            <Progress
              value={uploadProgress}
              className="h-1 w-full bg-zinc-200"
            />
            <p className="text-center text-sm text-gray-600 mt-2">
              Cargando: {uploadProgress}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
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
        <UploadDropzone onClose={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
