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

// ✅ Ruta pública
app.get('/mcp.json', (req, res) => {
  const manifest = fs.readFileSync('mcp.json', 'utf-8');
  res.setHeader('Content-Type', 'application/json');
  res.send(manifest);
});

// ✅ Middleware solo aplicado donde se necesita
const authMiddleware: RequestHandler = (req, res, next) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ') || auth.split(' ')[1] !== AUTH_TOKEN) {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }
  next();
};

// ✅ Ruta protegida
app.get('/resources/users', authMiddleware, async (req, res) => {
  try {
    const params: any = { select: '*' };

    Object.entries(req.query).forEach(([key, value]) => {
      params[key] = `eq.${value}`;
    });

    const { data } = await supabase.get('/users', { params });
    res.json({ resources: data });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener usuarios', details: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Servidor MCP corriendo en http://localhost:${port}`);
});
