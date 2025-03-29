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
const authMiddleware = (req, res, next) => {
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ') || auth.split(' ')[1] !== AUTH_TOKEN) {
        res.status(401).json({ error: 'No autorizado' });
        return; // <- detenemos la ejecución sin devolver nada
    }
    next();
};
app.use(authMiddleware);
// Recurso MCP: /resources/users
app.get('/resources/users', async (req, res) => {
    try {
        const params = { select: '*' };
        Object.entries(req.query).forEach(([key, value]) => {
            params[key] = `eq.${value}`;
        });
        const { data } = await supabase.get('/users', { params });
        res.json({ resources: data }); // <- formato MCP oficial
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener usuarios', details: error.message });
    }
});
// Servir el mcp.json (manifest) desde /mcp.json
const fs_1 = __importDefault(require("fs"));
app.get('/mcp.json', (req, res) => {
    const manifest = fs_1.default.readFileSync('mcp.json', 'utf-8');
    res.setHeader('Content-Type', 'application/json');
    res.send(manifest);
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`✅ Servidor MCP corriendo en http://localhost:${port}`);
});
