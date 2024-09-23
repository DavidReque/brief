import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";

const UserRole = {
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
} as const;

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.email) throw new TRPCError({ code: "UNAUTHORIZED" });

    // Revisa si el usuario estan en la base de datos
    const dbUser = await db.user.findFirst({
      where: {
        id: user.id,
      },
    });

    if (!dbUser) {
      // create user in db
      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
        },
      });
    }

    return { success: true as const };
  }),
  isAuthenticated: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    return !!user;
  }),
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    return await db.file.findMany({
      where: {
        userId,
        isDeleted: false,
      },
    });
  }),
  getUserAreas: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    const userAreas = await db.userArea.findMany({
      where: { userId },
      include: {
        area: true, // Incluye la información del área asociada
      },
    });

    if (!userAreas) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No se encontraron áreas para este usuario.",
      });
    }

    return userAreas.map(({ area }) => ({
      id: area.id,
      name: area.name,
      description: area.description,
    }));
  }),
  getFile: privateProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      // Buscar el archivo y verificar que el usuario tenga acceso al área del archivo
      const file = await db.file.findFirst({
        where: {
          key: input.key,
          area: {
            users: {
              some: {
                userId, // Verifica si el usuario pertenece al área del archivo
              },
            },
          },
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      return file;
    }),
  getCurrentUser: privateProcedure.query(({ ctx }) => {
    const user = ctx.user;

    if (!user) {
      throw new Error("No authenticated user found");
    }

    return {
      id: user.id,
      email: user.email,
      avatar: user.picture,
    };
  }),
  // procedimiento para que eliminar archivo
  deleteFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const file = await db.file.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });

      if (!file) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // En lugar de eliminar, actualizamos el campo isDeleted
      await db.file.update({
        where: {
          id: input.id,
        },
        data: {
          isDeleted: true,
        },
      });

      return file;
    }),
  // procedimiento para que el ADMIN pueda crear un área
  createArea: privateProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        userIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      // Verificar si el usuario es admin en alguna área
      const isAdmin = await db.userArea.findFirst({
        where: { userId, role: "ADMIN" },
      });

      if (!isAdmin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No tienes permiso para crear áreas",
        });
      }

      const newArea = await db.area.create({
        data: {
          name: input.name,
          description: input.description,
          users: {
            create: [
              ...input.userIds.map((id) => ({
                userId: id,
                role: UserRole.MEMBER,
              })),
              {
                userId,
                role: UserRole.ADMIN,
              },
            ],
          },
        },
      });

      return newArea;
    }),
  //  procedimiento para agregar un usuario a un área
  addUserToArea: privateProcedure
    .input(
      z.object({
        areaId: z.string(),
        userId: z.string(),
        role: z.enum(["ADMIN", "MEMBER"]).optional().default("MEMBER"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      // Verificar si el usuario actual es admin del área
      const isAdmin = await db.userArea.findFirst({
        where: {
          userId,
          areaId: input.areaId,
          role: "ADMIN",
        },
      });

      if (!isAdmin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No tienes permiso para agregar usuarios a esta área",
        });
      }

      const userArea = await db.userArea.create({
        data: {
          areaId: input.areaId,
          userId: input.userId,
          role: input.role,
        },
      });

      return userArea;
    }),

  //  procedimiento para eliminar un área
  deleteArea: privateProcedure
    .input(
      z.object({
        areaId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      // Verificar si el usuario es admin del área
      const isAdmin = await db.userArea.findFirst({
        where: { userId, areaId: input.areaId, role: "ADMIN" },
      });

      if (!isAdmin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No tienes permiso para eliminar esta área",
        });
      }

      // Eliminar todos los archivos asociados al área
      await db.file.deleteMany({
        where: {
          areaId: input.areaId,
        },
      });

      // Eliminar todas las relaciones de `userArea` asociadas al área
      await db.userArea.deleteMany({
        where: {
          areaId: input.areaId,
        },
      });

      // Ahora puedes eliminar el área
      await db.area.delete({
        where: { id: input.areaId },
      });

      return { success: true };
    }),

  getAllUsers: privateProcedure.query(async ({ ctx }) => {
    // verifica que el usuario esté autenticado
    const { userId } = ctx;

    // Recupera todos los usuarios de la base de datos
    const users = db.user.findMany({
      select: {
        id: true,
        email: true,
      },
    });

    return users;
  }),
  // Cambios en el procedimiento tRPC
  getAreaFiles: privateProcedure
    .input(z.object({ areaId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { areaId } = input;

      const userArea = await db.userArea.findFirst({
        where: { userId, areaId },
      });

      if (!userArea) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No tienes acceso a esta área.",
        });
      }

      const areaFiles = await db.file.findMany({
        where: {
          areaId,
          isDeleted: false,
        },
        include: {
          user: { select: { id: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      // Devolver un array vacío si no hay archivos
      return areaFiles.map((file) => ({
        id: file.id,
        name: file.name,
        url: file.url,
        createdAt: file.createdAt,
        fileType: file.fileType,
        uploadedBy: {
          id: file.user.id,
          email: file.user.email,
        },
      }));
    }),
  // Procedimiento para obtener archivos eliminados
  getDeletedFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    const deletedFiles = await db.file.findMany({
      where: {
        userId,
        isDeleted: true,
      },
    });

    return deletedFiles;
  }),
  // Procedimiento para restaurar archivos eliminados
  restoreFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const file = await db.file.findFirst({
        where: {
          id: input.id,
          userId,
          isDeleted: true,
        },
      });

      if (!file) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Restauramos el archivo, cambiando `isDeleted` a false
      await db.file.update({
        where: { id: input.id },
        data: { isDeleted: false },
      });

      return file;
    }),
  // Procedimiento para eliminar permanentemente un archivo
  permanentlyDeleteFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const file = await db.file.findFirst({
        where: {
          id: input.id,
          isDeleted: true,
        },
      });

      if (!file) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await db.file.delete({
        where: { id: input.id },
      });

      return file;
    }),
});

export type AppRouter = typeof appRouter;
