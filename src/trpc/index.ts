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
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { user, userId } = ctx;

    return await db.file.findMany({
      where: {
        userId,
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

      const file = await db.file.findFirst({
        where: {
          key: input.key,
          userId,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      return file;
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

      await db.file.delete({
        where: {
          id: input.id,
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
  getAreaFiles: privateProcedure
    .input(z.object({ areaId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { areaId } = input;

      // Verificar si el usuario tiene acceso al área (ya sea como ADMIN o MEMBER)
      const userArea = await db.userArea.findFirst({
        where: {
          userId,
          areaId,
        },
      });

      if (!userArea) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No tienes acceso a esta área.",
        });
      }

      // Recuperar los archivos del área junto con la información del usuario que los subió
      const areaFiles = await db.file.findMany({
        where: {
          areaId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (areaFiles.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No se encontraron archivos en esta área.",
        });
      }

      return areaFiles.map((file) => ({
        id: file.id,
        name: file.name,
        url: file.url,
        createdAt: file.createdAt,
        uploadedBy: {
          id: file.user.id,
          email: file.user.email,
        },
      }));
    }),
});

export type AppRouter = typeof appRouter;
