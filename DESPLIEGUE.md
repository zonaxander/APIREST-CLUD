# Cómo desplegar la API en Railway o en Render

Ambos son gratis para empezar, se conectan a GitHub y detectan Node.js
solos. La diferencia principal: **Railway** agrupa tu API y tu base de
datos en un mismo proyecto visual; **Render** es más simple si tu base
ya vive en otro lado (Supabase, Neon).

La API ya quedó lista para cualquiera de los dos: acepta una sola
variable `DATABASE_URL` (que es justo lo que ambos te dan al conectar
una base), o las variables sueltas `PG*` si prefieres eso.

## 0. Sube el proyecto a GitHub (una sola vez)

```bash
cd api
git init
git add .
git commit -m "API gestor de herramientas"
```

Crea un repositorio vacío en [github.com/new](https://github.com/new)
(puede ser privado) y sigue las instrucciones que te da GitHub para
conectar tu carpeta local:

```bash
git remote add origin https://github.com/TU_USUARIO/gestor-herramientas-api.git
git branch -M main
git push -u origin main
```

---

## Opción A · Railway (recomendada si aún no tienes base de datos)

1. Entra a [railway.com](https://railway.com) y crea cuenta con GitHub.
2. **New Project → Deploy from GitHub repo** → elige el repositorio
   que acabas de subir. Railway detecta que es Node.js solo.
3. **Si todavía no tienes la base de datos creada**: en el mismo
   proyecto, click **New → Database → Add PostgreSQL**. Railway la
   crea y te da una variable `DATABASE_URL` automáticamente.
4. Entra al servicio de tu API → pestaña **Variables** → agrega:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (Railway te sugiere
     esta referencia automática si ya tienes el servicio de Postgres)
   - `PGSSL` = `false` (la red interna de Railway no necesita SSL)
5. Si tu base de datos **todavía no tiene las tablas**, abre la
   pestaña **Data** del servicio Postgres → **Query** y pega el
   contenido completo de `00_todo_en_uno.sql`.
6. Pestaña **Settings → Networking → Generate Domain** para obtener tu
   URL pública (algo como `gestor-herramientas-api-production.up.railway.app`).
7. Prueba: `curl https://TU-DOMINIO.up.railway.app/api/health`

---

## Opción B · Render (recomendada si tu base ya está en Supabase/Neon)

1. Entra a [dashboard.render.com](https://dashboard.render.com) y crea
   cuenta con GitHub.
2. **New → Web Service** → conecta tu repositorio.
3. Configuración del servicio:
   - **Root Directory**: `api` (solo si subiste todo el proyecto junto
     con el frontend en un mismo repo; si el repo es solo la API, déjalo vacío)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
4. En la sección **Environment**, agrega las variables:
   - `DATABASE_URL` = la cadena de conexión de tu base (cópiala de
     Supabase en **Project Settings → Database → Connection string →
     URI**, o de Neon/Railway si usas esas)
   - `PGSSL` = `true` (Supabase y Neon exigen SSL desde fuera de su red)
5. **Create Web Service**. Render construye y despliega — tarda 2-3 minutos.
6. Tu URL pública queda como `https://TU-SERVICIO.onrender.com`.
7. Prueba: `curl https://TU-SERVICIO.onrender.com/api/health`

> **Nota sobre el plan gratuito de Render**: el servicio "se duerme"
> tras 15 minutos sin tráfico y la primera petición después tarda unos
> segundos en despertar. Para una demo está perfecto; si necesitas que
> esté siempre despierta, tendrías que pasar a un plan pago.

---

## Después del despliegue: conectar con Appsmith

1. En Appsmith, **Data → + New Datasource → REST API**.
2. Base URL: `https://TU-DOMINIO-PUBLICO/api`
3. Prueba cualquier endpoint, por ejemplo crea una Query GET a
   `/dashboard/resumen` y dale **Run** — deberías ver el mismo JSON que
   probamos por curl.
4. A partir de ahí, cada Query de Appsmith que antes era SQL directo
   pasa a ser una llamada REST a esta API (ver la sección "Conectar
   esto con Appsmith" en `README.md` de la API).

## Verificación rápida de que todo quedó bien

```bash
curl https://TU-DOMINIO/api/health
curl https://TU-DOMINIO/api/dashboard/resumen
curl https://TU-DOMINIO/api/herramientas
```

Si `dashboard/resumen` te devuelve `{"total":18, ...}` (o el número de
herramientas que hayas cargado), la API está correctamente conectada a
tu base de datos en producción.
