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
VITE_USE_PROXY=true
```

- **Local:** deja `VITE_USE_PROXY=true` y arranca backend + `npm run dev` o `npm run build` + `npm run preview`. El proxy de Vite reenvía `/api` al `VITE_API_URL` (evita CORS en el puerto 4173 de preview).
- **Nube:** pon `VITE_API_URL` con la URL del API desplegado. En el servidor del backend, añade en `ALLOWED_ORIGINS` la URL del panel (y `http://localhost:4173` si pruebas preview contra la nube). Reinicia el front tras cambiar `.env` (`npm run build` antes de `preview`).

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

### Recuperar contraseña (conductores)

1. En el backend, `FRONTEND_URL` debe ser la URL donde abres el panel (ej. `http://localhost:4174` en preview).
2. Sin `EMAIL_USER` / `EMAIL_PASS`, en desarrollo el enlace sale en la **consola del backend** al usar “Enviar enlace”.
3. Con Gmail, usa una [contraseña de aplicación](https://myaccount.google.com/apppasswords) en `EMAIL_PASS`.
4. El correo lleva a `/restablecer-contrasena?token=…` (las rutas `/forgot-password` y `/reset-password` redirigen solas).
