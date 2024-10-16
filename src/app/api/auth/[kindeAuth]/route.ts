// Importa la función handleAuth del paquete Kinde para manejar la autenticación
import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";

// Exporta la función GET que maneja las solicitudes de autenticación
export const GET = handleAuth();
