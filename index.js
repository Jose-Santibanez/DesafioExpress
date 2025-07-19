import express from "express";
import { writeFile, readFile } from "node:fs/promises";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";
import cors from "cors";

const app = express();
app.use(express.json()); // extraer la información del payload y trasnformarlo en JSON
app.use(cors()); // Habilitamos CORS
app.listen(3000, () => {
  console.log("Example app listening on port 3000");
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getCanciones = async () => {
  const fsReadFile = await readFile("canciones.json", "utf-8");
  const cancionesjson = JSON.parse(fsReadFile);
  return cancionesjson;
};
const creaCancionesjson = async (item) => {
  const cancionesjson = await getCanciones();
  cancionesjson.push(item);
  await writeFile("canciones.json", JSON.stringify(cancionesjson));
};

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
// GET: Enviamos todas las canciones al cliente en un JSON
app.get("/canciones", async (req, res) => {
  const canciones = await getCanciones();
  res.json(canciones);
});

// POST : Recibe los datos correspondientes y los inserta en un JSON
app.post("/canciones", async (req, res) => {
  const { titulo, artista, tono } = req.body;

  const nuevaCancion = {
    id: nanoid(),
    titulo,
    artista,
    tono,
  };

  creaCancionesjson(nuevaCancion);
  res.send("Se crea cancion con exito");
});

// DELETE: Busca el elemento y luego con un filter extraemos todas las coincidencias filter(e => e.id != id)

app.delete("/canciones/:id", async (req, res) => {
  let { id } = req.params;

  let canciones = await getCanciones();

  let cancion = canciones.find((e) => e.id == id);

  if (!cancion) {
    res.status(404).json({ mensaje: "cancion no existe" });
  }

  canciones = canciones.filter((e) => e.id != id);
  await writeFile("canciones.json", JSON.stringify(canciones));
  res.json(canciones);
});

// PUT: petición para actualizar una canción
app.put("/canciones/:id", async (req, res) => {
  let { id } = req.params;
  let canciones = await getCanciones();
  const cancionActualizada = req.body;
  const index = canciones.findIndex((e) => e.id === id);

  canciones[index] = cancionActualizada;
   
  await writeFile('canciones.json', JSON.stringify(canciones))
  res.json(canciones);
});
