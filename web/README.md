# EcoTrack Web Frontend

Frontend web para EcoTrack construido con React, Vite, TypeScript y Tailwind CSS.

## Características

- ✅ Autenticación JWT (Access + Refresh Token)
- ✅ Gestión de sesión con React Context
- ✅ Interceptor automático de Axios para renovación de tokens
- ✅ Validación de formularios con Zod
- ✅ Interfaz responsiva con Tailwind CSS
- ✅ Funcionalidades GDPR (derecho al olvido)
- ✅ Panel de auditoría (ADMIN)
- ✅ TypeScript strict mode

## Stack Tecnológico

- **Runtime**: Node.js 18+
- **Framework**: React 18.2+
- **Build Tool**: Vite 5.x
- **Language**: TypeScript 5.3+
- **Styling**: Tailwind CSS 3.3+
- **API Client**: Axios 1.6+
- **Validation**: Zod 4.4+
- **Routing**: React Router DOM 6.20+

## Instalación

```bash
# Clonar y navegar al proyecto
cd web

# Instalar dependencias
npm install

# Crear archivo .env local
cp .env.example .env.local
```

## Configuración

Edita `.env.local` con tus valores:

```env
VITE_API_URL=http://localhost:3000
VITE_REFRESH_TOKEN_COOKIE=false
```

### VITE_API_URL

URL del backend. Por defecto: `http://localhost:3000`

### VITE_REFRESH_TOKEN_COOKIE

- `true`: El refresh token viene en cookie HttpOnly (más seguro)
- `false`: El refresh token se devuelve en la respuesta JSON

## Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Verificar código
npm run lint

# Corregir errores automáticamente
npm run lint:fix
```

## Build para Producción

```bash
# Compilar y empaquetar
npm run build

# Vista previa del build
npm run preview
```

## Estructura de Carpetas

```
src/
├── components/        # Componentes reutilizables
├── screens/          # Pantallas/páginas principales
├── services/         # Servicios (API, Auth Context, Axios)
├── types/            # Interfaces TypeScript
├── validators/       # Esquemas Zod
├── hooks/            # Custom React hooks
├── utils/            # Funciones auxiliares
├── contexts/         # Contextos React
└── App.tsx          # Componente raíz
```

## Autenticación

### Flujo de Login

1. Usuario introduce email y contraseña
2. Solicitud POST a `/auth/login`
3. Backend devuelve `{ user, accessToken, refreshToken }`
4. AccessToken se guarda en estado React + localStorage
5. RefreshToken se guarda en localStorage (o cookie si está habilitada)
6. AuthContext actualiza el estado global

### Interceptor de Refresh Token

Cuando una solicitud devuelve 401:

1. El interceptor intenta hacer POST a `/auth/refresh`
2. Si es exitoso, guarda el nuevo token y reintenta la solicitud original
3. Si falla, limpia tokens y dispara evento `auth:logout`

### Endpoints Requeridos

```
POST   /auth/register         # Registrar usuario (solo ADMIN)
POST   /auth/login            # Login
POST   /auth/refresh          # Renovar token
POST   /auth/logout           # Logout simple
POST   /auth/logout-all       # Logout en todos los dispositivos
GET    /auth/me               # Obtener datos del usuario actual
```

## Privacidad & GDPR

### Derecho al Olvido

```typescript
import { privacyApi } from '@/services/api';

await privacyApi.anonymizeMe({
  confirmAnonymization: true,
  reason: 'No deseo continuar con el servicio'
});
```

### Auditorías

```typescript
// Auditoría de aceptación de políticas
const auditAcceptance = await privacyApi.getAuditsPolicyAcceptance({
  page: 1,
  limit: 20,
  from: '2024-01-01T00:00:00Z',
  to: '2024-01-31T23:59:59Z'
});

// Auditoría de anonimizaciones
const auditAnonymization = await privacyApi.getAuditsAnonymization({
  page: 1,
  limit: 20
});
```

## Validación con Zod

### Registro

```typescript
import { RegisterSchema } from '@/validators';

// Schema automáticamente validado
const formData = {
  name: 'Juan Pérez',
  email: 'juan@example.com',
  password: 'Seguro123',  // Min 8, mayúscula, número
  role: 'STAFF',
  acceptedPolicy: true
};

const result = RegisterSchema.safeParse(formData);
```

### Personalización de Validadores

Edita `src/validators/index.ts` para:

- Cambiar requisitos de contraseña
- Agregar validaciones personalizadas
- Modificar mensajes de error

## Manejo de Errores

```typescript
import { useAuth } from '@/services/auth-context';

export function LoginForm() {
  const { login, error, clearError } = useAuth();

  const handleSubmit = async (data) => {
    try {
      await login(data);
      // Redirigir después del login exitoso
    } catch (err) {
      console.error(err);
      // El error ya está en `error` del contexto
    }
  };

  return (
    <>
      {error && <div className="text-red-500">{error}</div>}
      <form onSubmit={handleSubmit}>
        {/* Formulario */}
      </form>
    </>
  );
}
```

## Hooks Disponibles

### useAuth()

Accede al contexto de autenticación:

```typescript
const { user, accessToken, isLoading, error, login, logout } = useAuth();
```

## Testeo

```bash
# Ejecutar pruebas (si se añade después)
npm run test

# Cobertura
npm run test:coverage
```

## Deployment

### Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel
```

### Netlify

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Desplegar
netlify deploy --prod --dir dist
```

## Requisitos de Seguridad

- ✅ HTTPS en producción (Vercel, Netlify habilitado por defecto)
- ✅ Access token solo en memoria (no guardado en storage)
- ✅ Refresh token en localStorage (o cookie HttpOnly)
- ✅ Headers de seguridad desde el backend (CORS, CSP, HSTS)
- ✅ Rate limiting desde el backend

## Troubleshooting

### "Token refresh failed"

- Verifica que `VITE_API_URL` sea correcto
- Comprueba que el backend está ejecutándose
- Revisa la consola del navegador para más detalles

### CORS Errors

- El backend debe tener CORS habilitado
- Verifica `Access-Control-Allow-Origin` en los headers

### Tokens no se guardan

- Comprueba que localStorage está habilitado
- En privado/incógnito, localStorage es temporal

## Licencia

MIT
