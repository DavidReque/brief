"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "./ui/use-toast";

interface FileRendererProps {
  url: string;
  fileType: string;
}

const FileRenderer = ({ url, fileType }: FileRendererProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError(true);
        toast({
          title: `Error al cargar el archivo ${fileType.toUpperCase()}`,
          description: "El archivo tardó demasiado en cargar.",
          variant: "destructive",
        });
      }
    }, 10000); // 10 segundos de timeout

    return () => clearTimeout(timer);
  }, [loading, toast, fileType]);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    setLoading(false);
    setError(true);
    console.error("Error loading file:", e);
    toast({
      title: `Error al cargar el archivo ${fileType.toUpperCase()}`,
      description:
        "No se pudo cargar el archivo. Por favor, intenta nuevamente.",
      variant: "destructive",
    });
  };

  const getViewerUrl = () => {
    if (fileType === "EXCEL" || fileType === "WORD") {
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
    <div className="w-full h-[calc(100vh-3.5rem)] bg-white rounded-md shadow flex flex-col items-center">
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
        {error && (
          <div className="flex justify-center items-center h-full">
            <p className="text-red-600">No se pudo cargar el archivo</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileRenderer;
