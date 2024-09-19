"use client";

import React, { useCallback, useState } from "react";
import { useToast } from "./ui/use-toast";
import { trpc } from "@/app/_trpc/client";
import { jsPDF } from "jspdf";
import axios from "axios";
import { Progress } from "./ui/progress";
import {
  Cloud,
  Loader2,
  X,
  Image as ImageIcon,
  Upload,
  ChevronUp,
  ChevronDown,
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
    const pdf = new jsPDF();
    for (let i = 0; i < images.length; i++) {
      if (i > 0) pdf.addPage();
      const image = await loadImage(images[i]);
      const format = getImageFormat(images[i]);
      pdf.addImage(image as string, format, 10, 10, 190, 280);
    }
    return pdf.output("blob");
  };

  const getImageFormat = (image: File): string => {
    const extension = image.name.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "jpeg":
      case "jpg":
        return "JPEG";
      case "png":
        return "PNG";
      case "gif":
        return "GIF";
      case "bmp":
        return "BMP";
      case "svg":
        return "SVG";
      default:
        throw new Error("Formato de imagen no soportado");
    }
  };

  const loadImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target?.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
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
    <div className=" bg-white shadow-md rounded-lg p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4">Imágenes seleccionadas</h2>
      {selectedImages.length === 0 ? (
        <p className="text-gray-500">No hay imágenes seleccionadas</p>
      ) : (
        selectedImages.map((file, index) => (
          <div
            key={index}
            className="flex items-center justify-between mb-2 bg-gray-50 p-2 rounded"
          >
            <div className="flex items-center">
              <span className="mr-2 font-semibold">{index + 1}.</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {/* Se incrementa el tamaño máximo y se añade el truncate */}
                    <h3 className="text-lg font-medium text-gray-900 max-w-[250px]">
                      {file.name}
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{file.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center">
              <button
                onClick={() => index > 0 && moveImage(index, "up")}
                disabled={index === 0}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-50 mr-2"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                onClick={() =>
                  index < selectedImages.length - 1 && moveImage(index, "down")
                }
                disabled={index === selectedImages.length - 1}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-50 mr-2"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <button
                onClick={() => removeImage(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <SideBar isAdmin={isAdmin} />
      {/* Main content */}
      <div className="flex-1 p-8 order-1 md:order-1 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Generador de PDF</h1>

        <h1 className="text-sm font-bold mb-3">Nombre del PDF</h1>
        <Input
          type="text"
          placeholder="Nombre del PDF"
          value={pdfName}
          onChange={(e) => setPdfName(e.target.value)}
          className="mb-4"
        />

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <Dropzone
            onDrop={handleImageDrop}
            accept={{ "image/*": [".jpeg", ".png", ".jpg"] }}
          >
            {({ getRootProps, getInputProps }) => (
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition duration-300"
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">
                  Arrastra y suelta imágenes aquí, o haz clic para seleccionar
                  archivos
                </p>
              </div>
            )}
          </Dropzone>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <Select value={selectedArea} onValueChange={setSelectedArea}>
            <SelectTrigger className="w-full mb-4">
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
            onClick={handleGenerateAndUpload}
            disabled={
              isGenerating ||
              isUploading ||
              selectedImages.length === 0 ||
              !selectedArea
            }
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando PDF...
              </>
            ) : isUploading ? (
              <>
                <Cloud className="mr-2 h-4 w-4" />
                Subiendo PDF...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Generar y Subir PDF
              </>
            )}
          </Button>
        </div>

        {(isGenerating || isUploading) && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <Progress value={progress} className="w-full" />
            <p className="text-center mt-2">
              {isGenerating ? "Generando PDF..." : "Subiendo PDF..."}
            </p>
          </div>
        )}
      </div>

      {/* Sidebar con lista de imagenes  */}
      <div className="w-full md:w-[320px] bg-white shadow-md p-4 overflow-y-auto order-2 md:order-2">
        {renderImageList()}
      </div>
    </div>
  );
};

export default PDFGeneratorUploader;
