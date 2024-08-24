"use client";

import { Loader2 } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { useState, useEffect } from "react";

interface FileRendererProps {
  url: string;
}

const FileRenderer = ({ url }: FileRendererProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [useZoho, setUseZoho] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError(true);
        toast({
          title: "Error al cargar el archivo",
          description:
            "El archivo tardó demasiado en cargar. Intentando con Zoho Viewer...",
          variant: "destructive",
        });
        setUseZoho(true);
      }
    }, 10000); // 10 segundos de timeout

    return () => clearTimeout(timer);
  }, [loading, toast]);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    if (!useZoho) {
      toast({
        title: "Error al cargar el archivo con Office 365",
        description: "Intentando con Zoho Viewer...",
        variant: "destructive",
      });
      setUseZoho(true);
    } else {
      toast({
        title: "Error al cargar el archivo",
        description:
          "No se pudo cargar el archivo con ningún visor. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  const getViewerUrl = () => {
    if (useZoho) {
      return `https://docs.zoho.com/officeapi/v1/viewer?url=${encodeURIComponent(
        url
      )}`;
    } else if (!useZoho) {
      // Office 365 viewer URL
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        url
      )}`;
    } else {
      return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
        url
      )}`;
    }
  };

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center h-[calc(100vh-3.5rem)]">
      <div className="flex-1 w-full relative">
        {loading && !error && (
          <div className="absolute inset-0 flex justify-center items-center bg-white">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        {!error && (
          <iframe
            src={getViewerUrl()}
            width="100%"
            height="100%"
            frameBorder="0"
            onLoad={handleLoad}
            onError={handleError}
            className="rounded-md absolute inset-0"
            style={{ visibility: loading ? "hidden" : "visible" }}
          />
        )}
        {error && !useZoho && (
          <div className="flex justify-center items-center h-full">
            <p className="text-yellow-600">
              Intentando cargar con Zoho Viewer...
            </p>
          </div>
        )}
        {error && useZoho && (
          <div className="flex justify-center items-center h-full">
            <p className="text-red-600">No se pudo cargar el archivo</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileRenderer;
