"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
const AUTH_TOKEN = process.env.AUTH_TOKEN;
console.log('🔐 AUTH_TOKEN cargado desde .env:', AUTH_TOKEN);
const supabase = axios_1.default.create({
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
    // Contenido hardcodeado como respaldo
    const manifestContent = {
        "name": "MCP API",
        "version": "1.0.0",
        // Añade aquí el contenido que debería tener tu mcp.json
    };
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(manifestContent);
});
// 🔐 Middleware solo para rutas protegidas
const authMiddleware = (req, res, next) => {
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
        const params = { select: '*' };
        Object.entries(req.query).forEach(([key, value]) => {
            params[key] = `eq.${value}`;
        });
        const { data } = await supabase.get('/users', { params });
        res.status(200).json({ resources: data });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener usuarios', details: error.message });
    }
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`✅ Servidor MCP corriendo en http://localhost:${port}`);
});
