"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useToast } from "./ui/use-toast";
import { trpc } from "@/app/_trpc/client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { X } from "lucide-react";
import SideBar from "./SideBar";

type Props = {
  isAdmin: boolean;
};

const CreateForm = ({ isAdmin }: Props) => {
  const router = useRouter();
  const { toast } = useToast();
  const [areaName, setAreaName] = useState("");
  const [areaDescription, setAreaDescription] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const { data: users } = trpc.getAllUsers.useQuery();
  const { data: currentUser } = trpc.getCurrentUser.useQuery();

  const createArea = trpc.createArea.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Área creada",
        description: "El área se ha creado con éxito.",
      });
      router.push(`/dashboard/areas/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No fue posible crear el área en estos momentos",
        variant: "destructive",
      });
    },
  });

  const handleCreateArea = () => {
    if (areaName.trim() === "" || selectedUsers.length === 0) {
      toast({
        title: "No fue posible crear el área",
        description:
          "Por favor completa todos los campos y selecciona al menos un usuario.",
        variant: "destructive",
      });
      return;
    }

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

  const filteredUsers =
    users?.filter((user) => user.id !== currentUser?.id) || [];

  return (
    <div className="flex h-screen bg-gray-100">
      <SideBar isAdmin={isAdmin} />
      <main className="flex-1 p-6 overflow-auto">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Crear nueva área
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateArea();
              }}
              className="space-y-4"
            >
              <div>
                <Input
                  placeholder="Nombre del área"
                  value={areaName}
                  onChange={(e) => setAreaName(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Textarea
                  placeholder="Descripción del área"
                  value={areaDescription}
                  onChange={(e) => setAreaDescription(e.target.value)}
                  className="w-full h-24"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">
                  Agregar usuarios al área:
                </label>
                <Select onValueChange={handleUserSelect}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <h3 className="text-md font-semibold mb-2">
                  Usuarios seleccionados:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((userId) => (
                    <Badge
                      key={userId}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {users?.find((u) => u.id === userId)?.email}
                      <button
                        onClick={() => handleUserSelect(userId)}
                        className="text-xs hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full">
                Crear área
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateForm;
