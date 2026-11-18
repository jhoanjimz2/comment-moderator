# Comment Moderator

Aplicación web desarrollada con Angular 22 para la clasificación automática y visualización de comentarios de una comunidad.

Proyecto realizado como prueba técnica.

## Funcionalidades

- Lectura de 20 comentarios desde un archivo JSON local.
- Clasificación automática en tres categorías: `ok`, `spam` y `revisar`.
- Visualización de estadísticas por categoría.
- Filtros por estado de clasificación.
- Búsqueda de comentarios por usuario o contenido.
- Visualización del motivo de clasificación y número de reportes.
- Manejo de estados de carga, error y ausencia de resultados.
- Interfaz adaptable a dispositivos móviles.

## Tecnologías utilizadas

- Angular 22 y TypeScript.
- Standalone Components.
- Angular Signals y Computed Signals.
- RxJS y HttpClient.
- SCSS.
- Vitest para pruebas unitarias.

## Requisitos

- Node.js compatible con Angular 22.
- Gestor de paquetes npm o Yarn.
- Angular CLI disponible mediante las dependencias del proyecto.

## Instalación y ejecución

Clonar el repositorio:

```bash
git clone https://github.com/jhoanjimz2/comment-moderator.git
cd comment-moderator
```

Instalar las dependencias:

```bash
npm install
```

Iniciar la aplicación:

```bash
npm start
```

Abrir `http://localhost:4200` en el navegador.

## Pruebas unitarias

Ejecutar:

```bash
npm test -- --watch=false
```

El proyecto incluye 16 pruebas que verifican reglas de clasificación, preservación de datos, casos ambiguos y los resultados esperados para los 20 comentarios originales.

Para generar una compilación de producción:

```bash
npm run build
```

## Estructura del proyecto

```text
src/app/
├── core/
│   └── models/
│       └── comment.model.ts
├── features/
│   └── moderation/
│       ├── data/
│       │   └── comment.service.ts
│       ├── domain/
│       │   ├── classification-rules.ts
│       │   ├── comment-classifier.ts
│       │   └── comment-classifier.spec.ts
│       ├── moderation.ts
│       ├── moderation.html
│       └── moderation.scss
├── app.config.ts
└── app.ts

public/
└── data/
    └── comentarios.json
```

## Criterios de clasificación

La clasificación utiliza reglas deterministas y sigue un orden de prioridad:

1. **Comentario vacío:** requiere revisión.
2. **Amenazas:** requiere revisión.
3. **Insultos:** requiere revisión.
4. **Publicidad no solicitada:** se clasifica como spam.
5. **Posibles números telefónicos:** requieren revisión.
6. **Enlaces acompañados de preguntas:** requieren revisión.
7. **Tres o más reportes:** requieren revisión.
8. **Sin coincidencias:** el comentario se clasifica como `ok`.

La categoría `revisar` no significa necesariamente que el comentario incumpla las normas; indica que conviene una evaluación humana.

## Resultados del conjunto de datos

Los 20 comentarios originales producen los siguientes resultados bajo los criterios definidos:

| Categoría | Cantidad |
|---|---:|
| `ok` | 9 |
| `spam` | 4 |
| `revisar` | 7 |
| **Total** | **20** |

Estos resultados representan decisiones de clasificación del proyecto, no etiquetas oficiales proporcionadas con el archivo.

## Decisiones técnicas

La lógica de clasificación se implementó mediante funciones independientes de Angular. Esto permite probarla sin renderizar componentes y facilita modificar las reglas sin afectar la interfaz.

Se utilizaron Signals para gestionar filtros, búsqueda y estadísticas derivadas, y HttpClient para separar la obtención de datos de su presentación.

No se incorporó un backend ni una API de inteligencia artificial porque el alcance de esta primera versión permite resolver el problema localmente, sin credenciales, costos externos o dependencias de red adicionales.

## Limitaciones y posibles mejoras

La clasificación utiliza coincidencias de palabras y patrones; por lo tanto, puede generar falsos positivos y falsos negativos, especialmente ante sarcasmo, variaciones lingüísticas o amenazas indirectas.

Entre las mejoras futuras se consideran:

- Incorporar análisis contextual mediante IA a través de un backend seguro.
- Permitir revisión manual y corrección de categorías.
- Registrar decisiones de moderación.
- Ampliar los patrones de detección y las pruebas.
- Incorporar paginación para grandes volúmenes de comentarios.

## Uso de inteligencia artificial

Se utilizó ChatGPT como apoyo durante el desarrollo para discutir alternativas, revisar reglas, proponer pruebas y analizar errores.

Las propuestas se verificaron mediante ejecución local, pruebas unitarias y compilaciones. Durante el proceso se corrigieron falsos positivos relacionados con enlaces, expresiones regulares y expectativas de clasificación.

La aplicación no utiliza servicios de IA durante su ejecución.
