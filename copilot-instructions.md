# Copilot Instructions - gpt-memo-ionic

Este archivo define reglas practicas para contribuir con GitHub Copilot en este repositorio.

## Objetivo del proyecto

Aplicacion GTD en Ionic/Angular con:
- tareas por etapa GTD,
- categorias dinamicas,
- navegacion por swipe entre vistas por categoria,
- modo oscuro persistente,
- persistencia local (localStorage).

## Reglas de codigo

1. Mantener tipado fuerte en TypeScript.
2. Preservar enfoque mobile-first en UI.
3. Evitar cambios grandes de estilo fuera del alcance pedido.
4. Mantener compatibilidad con Ionic 8 y Angular 20.
5. No romper persistencia existente:
- tareas: gtd.memo.tasks.v1
- categorias: gtd.memo.categories.v1
- tema: gtd.memo.theme.v1

## Convenciones funcionales

1. Si agregas nueva categoria, debe guardarse en localStorage.
2. Si cambias comportamiento de swipe, conservar:
- swipe derecha: avanzar vista de categoria
- swipe izquierda: volver vista anterior
3. La vista "General" siempre debe incluir todas las categorias.
4. La categoria legacy bm debe migrar a trabajo si aparece en datos viejos.

## Reglas de pruebas

Antes de proponer cambios:
1. Actualizar/agregar pruebas en:
- src/app/home/home.page.spec.ts
- src/app/app.component.spec.ts (si afecta tema global)
2. Ejecutar al menos:

```bash
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

3. Si no puedes correr pruebas, explicarlo claramente en la entrega.

## Regla de entrega

Cuando Copilot modifique funcionalidad:
1. Resumir archivos cambiados.
2. Explicar impacto funcional.
3. Reportar resultado de build/tests.
4. Indicar riesgos pendientes si existen.
