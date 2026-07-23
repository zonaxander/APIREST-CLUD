# API REST · Gestor de Préstamo de Herramientas

Node.js + Express + PostgreSQL. Se conecta directo a la base de datos
que ya construimos (`00_todo_en_uno.sql`) y expone un endpoint por cada
pantalla y acción de la app. Ya la probé de punta a punta (lectura,
retiro, devolución, mantenimiento y su cierre) contra un Postgres real.

## Cómo correrla en VS Code

1. Abre esta carpeta en VS Code.
2. Copia `.env.example` a `.env` y completa con los datos de tu base
   (los mismos host/usuario/contraseña que usaste para crear las tablas
   — Supabase, Neon, local, lo que hayas elegido).
3. En la terminal:
   ```bash
   npm install
   npm run dev
   ```
4. La API queda escuchando en `http://localhost:3000`. Prueba con:
   ```bash
   curl http://localhost:3000/api/health
   ```

Requiere **Node.js 18+**.

## Estructura

```
├── server.js                  arranca el servidor
├── .env.example                variables de conexión
└── src/
    ├── app.js                  arma express, monta rutas y errores
    ├── db/pool.js               conexión a Postgres
    ├── utils/asyncHandler.js    helper para errores en rutas async
    └── routes/
        ├── dashboard.js         resumen, más usadas, distribución, mantenimiento
        ├── herramientas.js      inventario, ficha, alta
        ├── prestamos.js         retiro, devolución, vencidos
        ├── mantenimientos.js    abrir y cerrar mantenimiento
        ├── ubicaciones.js       mapa en vivo y pings de ubicación
        ├── historial.js         bitácora de movimientos
        └── catalogos.js         categorías, zonas, usuarios
```

## Referencia de endpoints

### Panel / Dashboard
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/dashboard/resumen` | Tarjetas Total/Disponibles/En préstamo/Mantenimiento |
| GET | `/api/dashboard/mas-utilizadas?limit=7` | Ranking de uso (gráfico de barras) |
| GET | `/api/dashboard/distribucion-estado` | Conteo por estado (gráfico de dona) |
| GET | `/api/dashboard/mantenimiento-activo` | Herramientas en mantenimiento con motivo |

### Inventario
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/herramientas?estado=disponible&q=taladro` | Listado filtrable |
| GET | `/api/herramientas/:id` | Ficha completa de una herramienta |
| POST | `/api/herramientas` | Dar de alta una herramienta nueva |

### Préstamos
| Método | Ruta | Body | Descripción |
|---|---|---|---|
| POST | `/api/prestamos` | `{herramienta_id, usuario_id, zona_destino_id, fecha_devolucion_estimada?}` | Registrar retiro (409 si ya está prestada) |
| PATCH | `/api/prestamos/:herramientaId/devolucion` | — | Registrar devolución |
| GET | `/api/prestamos/vencidos` | — | Préstamos que ya debieron volver |

### Mantenimientos
| Método | Ruta | Body | Descripción |
|---|---|---|---|
| POST | `/api/mantenimientos` | `{herramienta_id, motivo, reportado_por?}` | Enviar a mantenimiento (409 si ya tiene uno abierto) |
| PATCH | `/api/mantenimientos/:herramientaId/cierre` | — | Cerrar mantenimiento → vuelve a disponible |

### Ubicación / Mapa
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/ubicaciones` | Posición actual de las 18 herramientas |
| POST | `/api/ubicaciones/:herramientaId/ping` | Registrar un ping de GPS/RFID |

### Historial
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/historial?limit=30` | Bitácora de movimientos, más reciente primero |

### Catálogos
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/categorias` | Lista de categorías |
| GET | `/api/zonas` | Lista de zonas (con coordenadas del mapa) |
| GET | `/api/usuarios` | Usuarios activos |
| POST | `/api/usuarios` | Crear usuario |

Todas las respuestas son JSON. Los errores devuelven
`{"error": "mensaje"}` con el código HTTP correspondiente (400, 404, 409
o 500).

## Conectar esto con Appsmith

Con esta API ya no necesitas el datasource de Postgres directo ni las
queries SQL de la entrega anterior: usa un **datasource REST API** en
Appsmith apuntando a esta URL base, y cada Query pasa a ser una llamada
HTTP. Por ejemplo, en vez de la query `getInventario` con SQL, sería
una Query REST `GET {{appsmith.store.apiUrl}}/api/herramientas` con
parámetros `estado` y `q`. El JSObject (`Herramientas.js`) casi no
cambia — solo dejan de usarse `this.params` y pasan a ser query params
o body JSON en la llamada `fetch`/Query REST.

## Conectar esto con el frontend React

Igual de directo: en `gestor-herramientas.jsx`, reemplaza el estado
`useState(seedTools)` por un `fetch('http://localhost:3000/api/herramientas')`
dentro de un `useEffect`, y cada acción (`doCheckout`, `doReturn`,
`doMaintenance`) por su llamada `fetch` POST/PATCH correspondiente en
vez de mutar el estado local directamente.

## Producción

- Nunca subas el archivo `.env` con credenciales reales a un repositorio.
- Agrega autenticación (JWT, API key) antes de exponerla públicamente —
  tal como está, cualquiera con la URL puede escribir en la base.
- Considera un servicio como Railway, Render o Fly.io para desplegarla.
