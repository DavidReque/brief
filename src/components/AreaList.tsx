"use client";

import { trpc } from "@/app/_trpc/client";
import React, { useState } from "react";
import Link from "next/link";
import { Loader2, Trash, FolderOpen, Plus } from "lucide-react";
import { Button } from "./ui/button";
import SideBar from "./SideBar";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

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
  const [searchTerm, setSearchTerm] = useState("");
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

  const filteredAreas = areas?.filter(
    (area) =>
      area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return <div>Error al cargar las áreas</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <SideBar isAdmin={isAdmin} />
      <div className="flex-1 flex flex-col overflow-hidden mt-12">
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Áreas</h2>
              {isAdmin && (
                <Link href="/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Nueva Área
                  </Button>
                </Link>
              )}
            </div>
            <Card className="mb-6">
              <CardContent className="pt-6">
                <Input
                  placeholder="Buscar áreas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </CardContent>
            </Card>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAreas?.map((area) => (
                <Card
                  key={area.id}
                  className="hover:shadow-lg transition-shadow duration-200"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {area.name}
                    </CardTitle>
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {area.description || "Sin descripción"}
                    </p>
                    <div className="flex justify-between items-center mt-4">
                      <Link href={`/dashboard/areas/${area.id}`}>
                        <Button variant="outline" size="sm">
                          Ver detalles
                        </Button>
                      </Link>
                      {isAdmin && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                ¿Estás seguro?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará
                                permanentemente el área y todos sus datos
                                asociados.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteArea(area.id)}
                              >
                                {currentlyDeletingArea === area.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Eliminar"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AreaList;
