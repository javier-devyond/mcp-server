import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import type { RequestHandler } from 'express';

dotenv.config();

const app = express();
app.use(express.json());

const AUTH_TOKEN = process.env.AUTH_TOKEN;
console.log('🔐 AUTH_TOKEN cargado desde .env:', AUTH_TOKEN);

const supabase = axios.create({
  baseURL: `${process.env.SUPABASE_URL}/rest/v1`,
  headers: {
    apikey: process.env.SUPABASE_API_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_API_KEY}`,
  }
});

// ✅ Ruta pública para test
app.get('/test', (req, res) => {
  res.status(200).json({ success: true });
});

// ✅ Ruta pública para Claude
app.get('/mcp.json', (req, res) => {
    try {
      const manifest = fs.readFileSync('mcp.json', 'utf-8');
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(manifest);
    } catch (err) {
      res.status(500).json({ error: 'Error al leer mcp.json' });
    }
  });
  
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(manifestContent);
});

// 🔐 Middleware solo para rutas protegidas
const authMiddleware: RequestHandler = (req, res, next) => {
  const auth = req.headers.authorization || '';
  const token = auth.split(' ')[1];

  if (!auth.startsWith('Bearer ') || token !== AUTH_TOKEN) {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }

  next();
};

// 🔐 Ruta protegida
app.get('/resources/users', authMiddleware, async (req, res) => {
  try {
    const params: any = { select: '*' };

    Object.entries(req.query).forEach(([key, value]) => {
      params[key] = `eq.${value}`;
    });

    const { data } = await supabase.get('/users', { params });
    res.status(200).json({ resources: data });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener usuarios', details: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Servidor MCP corriendo en http://localhost:${port}`);
});
