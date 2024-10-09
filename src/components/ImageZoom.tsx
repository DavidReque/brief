import { X, Download } from "lucide-react";
import React, { useState } from "react";

interface ImageZoomProps {
  src: string;
  onClose: () => void;
}

const ImageZoom: React.FC<ImageZoomProps> = ({ src, onClose }) => {
  const [isZoomed, setIsZoomed] = useState(false); // Estado para manejar el zoom

  const handleBackdropClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (e.target === e.currentTarget) {
      onClose(); // Cierra el modal al hacer clic fuera de la imagen
    }
  };

  const handleImageClick = () => {
    setIsZoomed((prev) => !prev); // Cambia el estado de zoom al hacer clic en la imagen
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = src;
    link.setAttribute("download", "image.jpg"); // Asegura que el archivo tenga un nombre y extensión
    link.setAttribute("target", "_blank"); // Opcional: abre en una nueva pestaña
    document.body.appendChild(link); // Agrega el enlace temporalmente al DOM
    link.click(); // Fuerza el clic
    document.body.removeChild(link); // Remueve el enlace
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick} // Detecta clic fuera de la imagen
    >
      <div
        className={`relative w-full h-full flex items-center justify-center ${
          isZoomed ? "overflow-scroll" : "overflow-hidden"
        }`} // Habilita el desplazamiento cuando está en zoom
      >
        <img
          src={src}
          alt="Zoomed image"
          onClick={handleImageClick} // Activa/desactiva el zoom al hacer clic en la imagen
          className={`transition-transform duration-300 cursor-pointer ${
            isZoomed ? "scale-150" : "scale-100"
          } max-w-full max-h-full object-contain`} // Aplica el zoom
        />

        {/* Botón de cierre */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Botón de descarga */}
        <button
          onClick={handleDownload}
          className="absolute bottom-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-colors"
        >
          <Download size={24} />
        </button>
      </div>
    </div>
  );
};

export default ImageZoom;
