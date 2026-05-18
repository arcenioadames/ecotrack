import "./env";
import { app } from "./app";

const PORT: number = Number(process.env.PORT ?? 3000);
const HOST: string = process.env.HOST ?? '0.0.0.0'; // Cambiar de localhost a 0.0.0.0

app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor corriendo en:`);
  console.log(`   Local: http://localhost:${PORT}`);
  console.log(`   Red:   http://${require('os').networkInterfaces()['Wi-Fi']?.[1]?.address || 'IP_NO_ENCONTRADA'}:${PORT}`);
  console.log(`   CORS:  ${process.env.CORS_ORIGIN || 'No configurado'}`);
});
