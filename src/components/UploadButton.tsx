"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";

import Dropzone from "react-dropzone";
import { Cloud, File, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Progress } from "./ui/progress";
import { useUploadThing } from "@/lib/uploadthing";
import { useToast } from "./ui/use-toast";
import { trpc } from "@/app/_trpc/client";
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
  const { toast } = useToast();

  const { startUpload } = useUploadThing("fileUploader");

  // Obtener las áreas del usuario
  const { data: areas } = trpc.getUserAreas.useQuery();

  const { mutate: startPolling } = trpc.getFile.useMutation({
    onSuccess(file) {
      router.push(`/dashboard/${file.id}`);
    },
    retry: true,
    retryDelay: 500,
  });

  const startSimulatedProgress = () => {
    setUploadProgress(0);

    // setInterval para incrementar el progreso cada 500ms.
    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        // Si el progreso alcanza el 95%, el intervalo se limpia para detener la simulación.
        if (prevProgress >= 95) {
          clearInterval(interval);
          return prevProgress;
        }
        return prevProgress + 5;
      });
    }, 500);

    return interval;
  };

  return (
    // Dropzone: Se utiliza para crear una zona donde los usuarios pueden arrastrar y
    // soltar archivos, o hacer clic para seleccionar un archivo
    <Dropzone
      multiple={false}
      onDrop={async (acceptedFile) => {
        setIsUploading(true);

        const progressInterval = startSimulatedProgress();

        const res = await startUpload(acceptedFile);

        if (!res) {
          return toast({
            title: "Algo salio mal",
            description: "Por favor intenta de nuevo mas tarde",
            variant: "destructive",
          });
        }

        const [fileResponse] = res;

        const key = fileResponse?.key;

        if (!key) {
          return toast({
            title: "Algo salio mal",
            description: "Por favor intenta de nuevo mas tarde",
            variant: "destructive",
          });
        }

        clearInterval(progressInterval);
        setUploadProgress(100);

        startPolling({ key });
      }}
    >
      {({ getRootProps, getInputProps, acceptedFiles }) => (
        <div
          {...getRootProps()}
          className="border h-64 m-4 border-dashed border-gray-300 rounded-lg"
        >
          <div className="flex items-center justify-center w-full h-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer g-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Cloud className="h-6 w-6 text-zinc-500 mb-2" />
                <p className="mb-2 text-sm text-zinc-700">
                  <span className="font-semibold">Click para cargar</span> o
                  arrastrar
                </p>
              </div>

              {/*Si hay un archivo aceptado (acceptedFiles), se muestra su nombre.*/}
              {acceptedFiles && acceptedFiles[0] ? (
                <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                  <div className="px-3 py-2 h-full grid place-items-center">
                    <File className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="px-3 py-2 h-full text-sm truncate">
                    {acceptedFiles[0].name}
                  </div>
                </div>
              ) : null}

              {isUploading ? (
                <div className="w-full mt-4 max-w-xs mx-auto">
                  <Progress
                    indicatorColor={
                      uploadProgress === 100 ? "bg-green-500" : ""
                    }
                    value={uploadProgress}
                    className="h-1 w-full bg-zinc-200"
                  />
                  {uploadProgress === 100 ? (
                    <div className="flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Redirigiendo...
                    </div>
                  ) : null}

                  <input
                    {...getInputProps()}
                    type="file"
                    id="dropzone-file"
                    className="hidden"
                  />
                </div>
              ) : null}
            </label>
          </div>

          <div className="my-6">
            <Select
              value={selectedArea}
              onValueChange={(value) => setSelectedArea(value)}
            >
              <SelectTrigger className="w-full bg-white border border-gray-300 rounded-md">
                <SelectValue placeholder="Seleccionar área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Seleccionar área">
                  Seleccionar área
                </SelectItem>
                {areas?.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </Dropzone>
  );
};

export default function UploadButton() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v);
        }
      }}
    >
      <DialogTrigger
        onClick={() => {
          setIsOpen(true);
        }}
        asChild
      >
        <Button>Cargar archivo</Button>
      </DialogTrigger>

      <DialogContent className="h-96">
        <UploadDropzone />
      </DialogContent>
    </Dialog>
  );
}
