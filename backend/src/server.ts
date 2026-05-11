import "./env";
import { app } from "./app";

const PORT: number = Number(process.env.PORT ?? 3000);

app.listen(PORT, () => {
  console.error(`Servidor corriendo en http://localhost:${PORT}`);
});
