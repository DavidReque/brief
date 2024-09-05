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
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Lista de Áreas</h2>
      <ul className="space-y-4">
        {areas?.map((area) => (
          <li
            key={area.id}
            className="border rounded-lg p-4 shadow-md bg-white hover:shadow-lg transition"
          >
            <div className="flex justify-between items-center">
              <Link href={`/dashboard/areas/${area.id}`} className="flex-1">
                <h3 className="text-xl font-semibold">{area.name}</h3>
                <p className="text-gray-600">{area.description}</p>
              </Link>
              {isAdmin && (
                <Button
                  onClick={() => handleDeleteArea(area.id)}
                  size="sm"
                  variant="destructive"
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
  );
};

export default AreaList;
