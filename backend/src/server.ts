import "./env";
import os from "os";

import { app } from "./app";

const PORT: number = Number(process.env.PORT ?? 3000);
const HOST: string = process.env.HOST ?? "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.warn("🚀 Servidor corriendo en:");
  console.warn(`   Local: http://localhost:${PORT}`);
  const osModule = os;
  const interfaces = osModule.networkInterfaces?.() as Record<string, Array<{ address?: string }>> | undefined;
  const wifiAddress = interfaces?.["Wi-Fi"]?.[1]?.address;
  console.warn(`   Red:   http://${wifiAddress || "IP_NO_ENCONTRADA"}:${PORT}`);

  // CORS_ORIGIN puede ser undefined en desarrollo
  const corsOrigin = process.env.CORS_ORIGIN || "No configurado";
  console.warn(`   CORS:  ${corsOrigin}`);
  console.warn(`   CORS:  ${process.env.CORS_ORIGIN || "No configurado"}`);
});
