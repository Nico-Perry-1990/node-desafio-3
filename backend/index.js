import express from 'express';
import cors from 'cors';
import pool from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/posts", async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM posts");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los datos" });
    }
});

app.post("/posts", async (req, res) => {
    try {
        const { titulo, url, descripcion } = req.body;
        const query = "INSERT INTO posts (titulo, img, descripcion, likes) VALUES ($1, $2, $3, $4) RETURNING *";
        const values = [titulo, url, descripcion, 0];
        const { rows } = await pool.query(query, values);
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Error al insertar el post" });
    }
});

app.put("/posts/like/:id", async (req, res) => {
    const { id } = req.params;
    console.log("Recibido ID para Like:", id); 
    try {
        const query = "UPDATE posts SET likes = COALESCE(likes, 0) + 1 WHERE id = $1 RETURNING *";
        const { rows } = await pool.query(query, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: "Post no encontrado" });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error("Error en PUT /posts/like:", error.message);
        res.status(500).json({ error: "Error al procesar el like" });
    }
});

app.delete("/posts/:id", async (req, res) => {
    const { id } = req.params;
    console.log("Recibido ID para Eliminar:", id); 
    try {
        const query = "DELETE FROM posts WHERE id = $1 RETURNING *";
        const { rows } = await pool.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Post no encontrado" });
        }
        res.json({ message: "Post eliminado con éxito" });
    } catch (error) {
        console.error("Error en DELETE /posts:", error.message);
        res.status(500).json({ error: "Error al eliminar el post" });
    }
});

app.listen(PORT, () => console.log(`Servidor encendido en puerto ${PORT}`));