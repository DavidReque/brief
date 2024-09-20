"use client";

import React, { useCallback, useState } from "react";
import { useToast } from "./ui/use-toast";
import { trpc } from "@/app/_trpc/client";
import { PDFDocument, rgb } from "pdf-lib";
import axios from "axios";
import { Progress } from "./ui/progress";
import {
  Cloud,
  Loader2,
  X,
  Upload,
  ChevronUp,
  ChevronDown,
  ImageIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import Dropzone from "react-dropzone";
import SideBar from "./SideBar";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type Props = {
  isAdmin: boolean;
};

const PDFGeneratorUploader = ({ isAdmin }: Props) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [pdfName, setPdfName] = useState<string>("");
  const { toast } = useToast();
  const { data: areas } = trpc.getUserAreas.useQuery();
  const router = useRouter();

  const handleImageDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedImages((prevImages) => [...prevImages, ...acceptedFiles]);
  }, []);

  const removeImage = (index: number) => {
    setSelectedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const generatePDF = async (images: File[]): Promise<Blob> => {
    const pdfDoc = await PDFDocument.create();

    for (const file of images) {
      const page = pdfDoc.addPage([600, 800]);

      const imageBytes = await file.arrayBuffer();
      let image;

      const format = file.type.split("/")[1];
      if (format === "jpeg" || format === "jpg") {
        image = await pdfDoc.embedJpg(imageBytes);
      } else if (format === "png") {
        image = await pdfDoc.embedPng(imageBytes);
      } else {
        throw new Error("Formato de imagen no soportado");
      }

      page.drawImage(image, {
        x: 50,
        y: 150,
        width: 500,
        height: 500,
      });
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: "application/pdf" });
  };

  const handleGenerateAndUpload = async () => {
    if (!selectedArea) {
      toast({
        title: "Área no seleccionada",
        description:
          "Por favor, selecciona un área antes de generar y cargar el PDF.",
        variant: "destructive",
      });
      return;
    }

    if (selectedImages.length === 0) {
      toast({
        title: "No hay imágenes seleccionadas",
        description:
          "Por favor, selecciona al menos una imagen para generar el PDF.",
        variant: "destructive",
      });
      return;
    }

    if (!pdfName.trim()) {
      toast({
        title: "Nombre del PDF no especificado",
        description: "Por favor, ingresa un nombre para el PDF.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const pdfBlob = await generatePDF(selectedImages);
      setIsGenerating(false);
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", pdfBlob, `${pdfName}.pdf`);
      formData.append("areaId", selectedArea);

      const response = await axios.post("/api/upload", formData, {
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setProgress(progress);
        },
      });

      if (response.status === 200) {
        toast({
          title: "Éxito",
          description: "PDF generado y cargado correctamente.",
        });
        router.push(`/dashboard/${response.data.fileId}`);
        setSelectedImages([]);
        setPdfName("");
      }
    } catch (error) {
      console.error("Error generating or uploading PDF:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al generar o cargar el PDF.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setIsUploading(false);
    }
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    setSelectedImages((prevImages) => {
      const newImages = [...prevImages];
      const [removed] = newImages.splice(index, 1);
      newImages.splice(direction === "up" ? index - 1 : index + 1, 0, removed);
      return newImages;
    });
  };

  const renderImageList = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Imágenes seleccionadas</CardTitle>
      </CardHeader>
      <CardContent>
        {selectedImages.length === 0 ? (
          <p className="text-gray-500">No hay imágenes seleccionadas</p>
        ) : (
          <div className="space-y-2">
            {selectedImages.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
              >
                <div className="flex items-center space-x-2">
                  <ImageIcon className="h-5 w-5 text-gray-500" />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <h3 className="text-sm font-medium text-gray-900 max-w-[200px] truncate">
                          {file.name}
                        </h3>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{file.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => index > 0 && moveImage(index, "up")}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      index < selectedImages.length - 1 &&
                      moveImage(index, "down")
                    }
                    disabled={index === selectedImages.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeImage(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <SideBar isAdmin={isAdmin} />
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Generador de PDF</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Configuración del PDF</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label
                htmlFor="pdfName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre del PDF
              </label>
              <Input
                id="pdfName"
                type="text"
                placeholder="Ingrese el nombre del PDF"
                value={pdfName}
                onChange={(e) => setPdfName(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="area"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Área
              </label>
              <Select onValueChange={(value) => setSelectedArea(value)}>
                <SelectTrigger id="area" className="w-full">
                  <SelectValue placeholder="Selecciona un área" />
                </SelectTrigger>
                <SelectContent>
                  {areas?.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Subir imágenes</CardTitle>
          </CardHeader>
          <CardContent>
            <Dropzone
              onDrop={handleImageDrop}
              accept={{ "image/*": [".jpeg", ".png", ".jpg"] }}
            >
              {({ getRootProps, getInputProps }) => (
                <div
                  {...getRootProps()}
                  className="border-dashed border-2 border-gray-300 p-6 text-center cursor-pointer rounded-md hover:bg-gray-50 transition-colors"
                >
                  <input {...getInputProps()} />
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Arrastra imágenes aquí o haz clic para seleccionarlas.
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Solo imágenes (.jpeg, .jpg, .png)
                  </p>
                </div>
              )}
            </Dropzone>
          </CardContent>
        </Card>

        {renderImageList()}

        <div className="mt-6">
          <Button
            onClick={handleGenerateAndUpload}
            className="w-full"
            disabled={
              isGenerating ||
              isUploading ||
              !selectedArea ||
              selectedImages.length === 0 ||
              !pdfName.trim()
            }
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando
                PDF...
              </>
            ) : isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subiendo
                PDF...
              </>
            ) : (
              <>
                <Cloud className="mr-2 h-4 w-4" /> Generar y Subir PDF
              </>
            )}
          </Button>
        </div>

        {isUploading && (
          <div className="mt-4">
            <Progress value={progress} className="w-full" />
            <p className="text-center text-sm text-gray-600 mt-2">
              Subiendo: {progress}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFGeneratorUploader;
