import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { trpc } from "@/app/_trpc/client";
import { useToast } from "./ui/use-toast";

type EditAreaModalProps = {
  isOpen: boolean;
  onClose: () => void;
  area: {
    id: string;
    name: string;
    description: string | null;
    users: { id: string; email: string }[];
  };
  onEdit: () => void;
};

const EditAreaModal: React.FC<EditAreaModalProps> = ({
  isOpen,
  onClose,
  area,
  onEdit,
}) => {
  const [name, setName] = useState(area.name);
  const [description, setDescription] = useState(area.description || "");
  const [selectedUsers, setSelectedUsers] = useState(
    area.users.map((user) => user.id)
  );
  const { toast } = useToast();

  const { data: allUsers } = trpc.getAllUsers.useQuery();
  const { data: currentUser } = trpc.getCurrentUser.useQuery();
  const editArea = trpc.editArea.useMutation({
    onSuccess: () => {
      toast({
        title: "Área actualizada",
        description: "El área se ha actualizado con éxito.",
      });
      onEdit();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No fue posible actualizar el área en estos momentos",
        variant: "destructive",
      });
    },
  });

  const filteredUsers =
    allUsers?.filter((user) => user.id !== currentUser?.id) || [];

  useEffect(() => {
    setName(area.name);
    setDescription(area.description || "");
    setSelectedUsers(area.users.map((user) => user.id));
  }, [area]);

  const handleUserSelect = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    editArea.mutate({
      id: area.id,
      name,
      description,
      userIds: selectedUsers,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Área</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Nombre del área"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Textarea
            placeholder="Descripción del área"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div>
            <label className="block mb-2 font-medium">Usuarios del área:</label>
            <Select onValueChange={handleUserSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar usuario" />
              </SelectTrigger>
              <SelectContent>
                {filteredUsers?.map((user) => (
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
              {selectedUsers
                .filter((userId) => userId !== currentUser?.id)
                .map((userId) => (
                  <Badge
                    key={userId}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {allUsers?.find((u) => u.id === userId)?.email}
                    <button
                      type="button"
                      onClick={() => handleUserSelect(userId)}
                      className="text-xs hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </Badge>
                ))}
              {currentUser && selectedUsers.includes(currentUser.id) && (
                <Badge
                  key={currentUser.id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {currentUser.email}
                </Badge>
              )}
            </div>
          </div>
          <Button type="submit">Guardar cambios</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAreaModal;
