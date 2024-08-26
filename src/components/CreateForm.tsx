"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useToast } from "./ui/use-toast";
import { trpc } from "@/app/_trpc/client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type Props = {};

const CreateForm = (props: Props) => {
  const router = useRouter();
  const { toast } = useToast();
  const [areaName, setAreaName] = useState("");
  const [areaDescription, setAreaDescription] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // obtener todos los usuarios
  const { data: users } = trpc.getAllUsers.useQuery();
  const createArea = trpc.createArea.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Área creada",
        description: "El área se ha creado con éxito.",
      });
      router.push(`/create-area/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No fue posible crear el area en estos momentos",
        variant: "destructive",
      });
    },
  });

  const handleCreateArea = () => {
    createArea.mutate({
      name: areaName,
      description: areaDescription,
      userIds: selectedUsers,
    });
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Crear nueva área</h1>
      <div className="mb-4">
        <Input
          placeholder="Nombre del área"
          value={areaName}
          onChange={(e) => setAreaName(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <Input
          placeholder="Descripción del área"
          value={areaDescription}
          onChange={(e) => setAreaDescription(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Agregar usuarios al área:</label>
        <Select onValueChange={handleUserSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar usuario" />
          </SelectTrigger>
          <SelectContent>
            {users?.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="mb-4">
        <h3 className="text-md font-semibold mb-2">Usuarios seleccionados:</h3>
        <ul>
          {selectedUsers.map((userId) => (
            <li key={userId} className="flex justify-between items-center mb-2">
              {users?.find((u) => u.id === userId)?.email}
              <Button
                onClick={() => handleUserSelect(userId)}
                variant="destructive"
                size="sm"
              >
                Eliminar
              </Button>
            </li>
          ))}
        </ul>
      </div>
      <Button onClick={handleCreateArea}>Crear area</Button>
    </div>
  );
};

export default CreateForm;
