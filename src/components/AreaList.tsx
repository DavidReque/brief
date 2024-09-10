"use client";

import { trpc } from "@/app/_trpc/client";
import React, { useState } from "react";
import Link from "next/link";
import { Loader2, Trash } from "lucide-react";
import { Button } from "./ui/button";
import SideBar from "./SideBar";

type Area = {
  id: string;
  name: string;
  description: string | null;
};

type AreaListProps = {
  isAdmin: boolean;
};

const AreaList = ({ isAdmin }: AreaListProps) => {
  const [currentlyDeletingArea, setCurrentlyDeletingArea] = useState<
    string | null
  >(null);
  const { data: areas, error, refetch } = trpc.getUserAreas.useQuery();
  const deleteAreaMutation = trpc.deleteArea.useMutation();

  const handleDeleteArea = async (areaId: string) => {
    setCurrentlyDeletingArea(areaId);
    try {
      await deleteAreaMutation.mutateAsync({ areaId });
      refetch();
    } catch (error) {
      console.error("Error al eliminar el área:", error);
    } finally {
      setCurrentlyDeletingArea(null);
    }
  };

  if (error) {
    return <div>Error al cargar las áreas</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <SideBar isAdmin={isAdmin} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-8 flex-shrink-0">
          <h2 className="text-2xl font-bold mb-4">Lista de Áreas</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <ul className="space-y-4">
            {areas?.map((area) => (
              <li
                key={area.id}
                className="border rounded-lg p-4 shadow-md bg-white hover:shadow-lg transition"
              >
                <div className="flex justify-between items-center">
                  <Link
                    href={`/dashboard/areas/${area.id}`}
                    className="flex-1 min-w-0"
                  >
                    <h3 className="text-xl font-semibold truncate">
                      {area.name}
                    </h3>
                    <p className="text-gray-600 truncate">{area.description}</p>
                  </Link>
                  {isAdmin && (
                    <Button
                      onClick={() => handleDeleteArea(area.id)}
                      size="sm"
                      variant="destructive"
                      className="ml-4 flex-shrink-0"
                    >
                      {currentlyDeletingArea === area.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AreaList;
