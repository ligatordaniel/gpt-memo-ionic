# gpt-memo-ionic

Aplicacion mobile-first con Ionic + Angular + Capacitor para gestion de tareas con metodo GTD.

## Funcionalidades

- Captura de tareas con etapas GTD: Inbox, Proxima accion, En espera, Programada, Algun dia, Hecha.
- Categorias dinamicas con color e icono (ej: ScriptDog, Personal, Trabajo y las que agregues).
- Vista General y vistas por categoria usando swipe horizontal.
- Modo oscuro manual con persistencia en memoria local.
- Persistencia local de tareas y categorias con localStorage.

## Stack

- Ionic 8
- Angular 20
- Capacitor 8
- Tailwind CSS 3
- Jasmine + Karma para pruebas unitarias

## Requisitos

- Node.js 20+
- npm 10+
- Ionic CLI (opcional para comandos Ionic)

## Instalacion

```bash
npm install
```

## Scripts

```bash
npm start        # levantar app en desarrollo
npm run build    # build de produccion
npm test         # pruebas unitarias con Karma/Jasmine
npm run lint     # lint del proyecto
```

## Desarrollo

1. Ejecuta la app:

```bash
npm start
```

2. Flujo base:
- Crea categorias en "Categorias personalizadas".
- Captura tareas y asigna categoria/etapa.
- Navega entre General y categorias con swipe en el panel de tareas.
- Activa modo oscuro desde el boton Claro/Oscuro.

## Android con Capacitor

```bash
ionic capacitor sync android
ionic capacitor open android
```

## Pruebas unitarias

Las pruebas cubren:
- Creacion de categorias dinamicas.
- Filtros por categoria/etapa.
- Navegacion por swipe.
- Cambio de estado de tareas.
- Persistencia de tema oscuro.
- Inicializacion de tema en AppComponent.

Ejecucion en modo CI/headless:

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

## Estructura relevante

- src/app/home/home.page.ts: logica GTD, categorias, swipe y persistencia.
- src/app/home/home.page.html: interfaz principal.
- src/app/home/home.page.scss: estilos de Home.
- src/app/home/home.page.spec.ts: pruebas unitarias Home.
- src/app/app.component.ts: inicializacion de tema global.
- src/app/app.component.spec.ts: pruebas unitarias AppComponent.
