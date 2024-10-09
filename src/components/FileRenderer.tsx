"use client";
import React, { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import { useToast } from "./ui/use-toast";
import ImageZoom from "./ImageZoom";

interface FileRendererProps {
  url: string;
  fileType: string;
}

const FileRenderer: React.FC<FileRendererProps> = ({ url, fileType }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showZoom, setShowZoom] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError(true);
        toast({
          title: `Error cargando ${fileType.toUpperCase()} archivo`,
          description: "Error cargando el archivo.",
          variant: "destructive",
        });
      }
    }, 15000);

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
      title: `Error cargando ${fileType.toUpperCase()} archivo`,
      description: "No se puede cargar el archivo. Por favor intenta de nuevo.",
      variant: "destructive",
    });
  };

  const getViewerUrl = () => {
    if (fileType === "EXCEL") {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        url
      )}&wdAllowInteractivity=True&wdDownloadButton=True&wdInConfigurator=True`;
    } else if (fileType === "WORD") {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        url
      )}`;
    } else if (fileType === "PDF") {
      return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
        url
      )}`;
    }
    return url;
  };

  return (
    <div className="w-full h-[calc(100vh-3.5rem)]  shadow flex flex-col items-center justify-center p-4">
      <div className="w-full h-full max-w-4xl max-h-[80vh]  shadow-lg overflow-hidden relative">
        {loading && !error && (
          <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-80 z-10">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          </div>
        )}
        {!error && fileType === "IMAGE" ? (
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={url}
              alt="Uploaded file"
              onLoad={handleLoad}
              onClick={() => setShowZoom(true)}
              className="max-w-full max-h-full object-contain cursor-pointer"
              style={{ visibility: loading ? "hidden" : "visible" }}
            />
          </div>
        ) : (
          !error && (
            <iframe
              src={getViewerUrl()}
              width="100%"
              height="100%"
              frameBorder="0"
              onLoad={handleLoad}
              onError={handleError}
              className="rounded-lg"
              style={{ visibility: loading ? "hidden" : "visible" }}
              allowFullScreen
            />
          )
        )}
        {error && (
          <div className="flex justify-center items-center h-full">
            <p className="text-red-600 text-center px-4">
              Error al cargar el archivo. Por favor intenta de nuevo.
            </p>
          </div>
        )}
      </div>
      {showZoom && <ImageZoom src={url} onClose={() => setShowZoom(false)} />}
    </div>
  );
};

export default FileRenderer;
