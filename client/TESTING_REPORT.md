# Pruebas Unitarias - VGZ

## Resumen de Pruebas Implementadas

Se han creado pruebas unitarias completas para los componentes y hooks más importantes del proyecto VGZ. Las pruebas cubren casos de uso principales, casos de error y edge cases.

### 📁 Estructura de Pruebas

```
src/__tests__/
├── components/
│   ├── GameCard.test.jsx    ✅ Componente principal para mostrar juegos
│   ├── Login.test.jsx       ✅ Componente de autenticación
│   └── Modal.test.jsx       ✅ Componente modal reutilizable
├── hooks/
│   ├── useApi.test.js       ✅ Hook para llamadas API
│   ├── useAuth.test.js      ✅ Hook de autenticación
│   └── useToggle.test.js    ✅ Hook de toggle
└── utils/
    └── testUtils.js         ✅ Utilidades para testing
```

### 🧪 Detalles de las Pruebas

#### **GameCard Component** (21 pruebas)
- ✅ Renderizado de información básica del juego
- ✅ Cálculo y visualización de valoraciones principales
- ✅ Manejo de diferentes tipos de valoraciones (positiva, negativa, meh)
- ✅ Visualización de valoraciones de usuario
- ✅ Interacciones (clic en card)
- ✅ Modo PostCard vs modo normal
- ✅ Manejo de casos edge (sin géneros, sin valoraciones, imágenes faltantes)
- ✅ Formateo de fechas y metadatos
- ✅ Limitación de géneros mostrados

#### **Login Component** (10 pruebas)
- ✅ Renderizado del formulario
- ✅ Manejo de inputs del usuario
- ✅ Envío de formulario con credenciales correctas
- ✅ Manejo de errores de autenticación
- ✅ Manejo de errores de red
- ✅ Estados de carga durante el envío
- ✅ Validación de formularios
- ✅ Enlaces de navegación
- ✅ Redirección después del login exitoso

#### **Modal Component** (13 pruebas)
- ✅ Renderizado condicional (abierto/cerrado)
- ✅ Visualización de título
- ✅ Interacciones de cierre (botón, overlay, tecla Escape)
- ✅ Prevención de cierre al hacer clic en contenido
- ✅ Manejo del scroll del body
- ✅ Limpieza de event listeners
- ✅ Renderizado de contenido hijo
- ✅ Portal rendering

#### **useAuth Hook** (7 pruebas)
- ✅ Inicialización con valores por defecto
- ✅ Carga de datos desde localStorage
- ✅ Funcionalidad de login
- ✅ Funcionalidad de logout
- ✅ Manejo de localStorage vacío
- ✅ Manejo de JSON inválido en localStorage

#### **useToggle Hook** (6 pruebas)
- ✅ Inicialización con valor por defecto
- ✅ Inicialización con valor personalizado
- ✅ Funcionalidad de toggle
- ✅ Funciones setTrue y setFalse
- ✅ Estabilidad de referencias entre renders

#### **useApi Hook** (8 pruebas)
- ✅ Inicialización con valores por defecto
- ✅ Llamadas API exitosas
- ✅ Inclusión de token de autorización
- ✅ Manejo de errores HTTP
- ✅ Manejo de errores de red
- ✅ Estados de loading
- ✅ Paso de opciones personalizadas a fetch

### 🛠️ Herramientas de Testing

#### **TestUtils**
- `renderWithRouter`: Wrapper para componentes que requieren React Router
- `mockLocalStorage`: Mock completo de localStorage
- `mockFetch`: Helper para mockear fetch
- `setupTest`: Configuración global para tests

#### **Setup Global**
- Configuración de Jest en `setupTests.js`
- Mocks globales para localStorage y window.location
- Supresión de warnings de desarrollo para logs más limpios

### 🎯 Métricas de Cobertura

Las pruebas cubren:
- **Componentes UI principales**: GameCard, Login, Modal
- **Lógica de negocio**: Hooks personalizados
- **Casos de error**: Manejo de fallos de red, datos inválidos
- **Interacciones de usuario**: Clics, teclas, formularios
- **Estados de loading**: Indicadores de carga y estados async

### 🚀 Ejecutar las Pruebas

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm test -- --watch

# Ejecutar solo pruebas que fallan
npm test -- --onlyFailures

# Ejecutar con cobertura
npm test -- --coverage
```

### 📊 Resultados Actuales

**Estado**: ✅ Todas las pruebas principales pasando
**Total**: 54+ pruebas implementadas
**Componentes cubiertos**: 3 principales
**Hooks cubiertos**: 3 principales

### 🔄 Mejoras Futuras

1. **Añadir más componentes**: NoteCard, Post, Sidebar
2. **Pruebas de integración**: Flujos completos de usuario
3. **Testing de performance**: React.memo y optimizaciones
4. **Snapshots**: Para cambios visuales
5. **E2E testing**: Con Cypress o Playwright

### 📝 Notas de Desarrollo

- Las pruebas están escritas siguiendo las mejores prácticas de Testing Library
- Se priorizan pruebas que reflejan el comportamiento del usuario
- Los mocks están centralizados en `testUtils.js`
- Cada componente tiene un conjunto completo de pruebas unitarias
- Las pruebas incluyen casos edge y manejo de errores
