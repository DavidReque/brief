import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";

const t = initTRPC.create();
const middleware = t.middleware;

const isAuth = middleware(async (opts) => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // Obtener las áreas del usuario
  const userAreas = await db.userArea.findMany({
    where: { userId: user.id },
    include: { area: true },
  });

  return opts.next({
    ctx: {
      userId: user.id,
      user,
      userAreas,
    },
  });
});

// middleware para verificar el acceso a un área específica

export const router = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuth);
