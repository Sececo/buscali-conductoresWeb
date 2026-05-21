# BusCali — Panel de conductores (Web)

Panel administrativo en **React + TypeScript + Vite** para gestionar conductores del sistema BusCali. Se conecta al backend en `buscali-backend`.

## Requisitos

- Node.js 18+
- Backend BusCali en ejecución (por defecto `http://localhost:3000`)

## Instalación

```bash
npm install
npm run setup
```

`npm run setup` copia `.env.example` → `.env` si aún no existe.

Variables en `.env`:

```env
VITE_API_URL=http://localhost:3000
```

Tras cambiar `.env`, reinicia `npm run dev`.

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run preview` | Vista previa del build |
| `npm run lint` | ESLint |
| `npm run setup` | Crear `.env` desde `.env.example` |

## Flujo con el backend

1. Inicia el backend (`npm run dev` en `buscali-backend`).
2. Inicia este panel (`npm run dev`).
3. Inicia sesión con teléfono y contraseña de un conductor registrado.
4. Gestiona conductores (listar, crear, editar, eliminar).

La autenticación usa cookie httpOnly y, si aplica, token JWT en cabecera `Authorization` (sesión en `localStorage` con “Recordarme” o en `sessionStorage` sin marcarlo).
