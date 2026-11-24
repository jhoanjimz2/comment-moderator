# Comment Moderator

Aplicación web de moderación de comentarios desarrollada como prueba técnica. Combina **Angular 22** para la interfaz y **NestJS** para la clasificación de contenido. Procesa un conjunto local de 20 comentarios, muestra estadísticas y permite buscar y filtrar los resultados.

## Funcionalidades

- Clasificación en `ok`, `spam` y `revisar`, con motivo y nivel de gravedad.
- Priorización de comentarios que requieren revisión, ordenados por gravedad descendente.
- Detección heurística de amenazas, insultos, publicidad no solicitada, datos de contacto, señales de enlaces sospechosos y múltiples reportes.
- Estadísticas, filtros por categoría y búsqueda por usuario o contenido.
- Interfaz responsive con estados de carga, error y ausencia de resultados.
- Dos proveedores de moderación seleccionables mediante configuración: **reglas** (predeterminado) y **Ollama** (opcional).

## Tecnologías

| Frontend | Backend | Pruebas |
| --- | --- | --- |
| Angular 22, TypeScript, componentes standalone, Signals, RxJS, HttpClient, SCSS | NestJS 12, TypeScript, API REST, `@nestjs/config`, Ollama opcional | Vitest |

## Requisitos

- Node.js y npm compatibles con las versiones de Angular y NestJS utilizadas.
- Dos terminales para ejecutar frontend y backend en desarrollo.
- **No es necesario instalar Ollama** para usar el proveedor predeterminado `rules`.

## Instalación y ejecución

Clonar el repositorio:

```bash
git clone https://github.com/jhoanjimz2/comment-moderator.git
cd comment-moderator
```

**1. Iniciar el backend** (terminal 1):

```bash
cd backend
npm ci
cp .env.example .env
npm run start:dev
```

El backend escucha en `http://localhost:3000` con la configuración de desarrollo utilizada en el proyecto.

**2. Iniciar el frontend** (terminal 2, desde la raíz del repositorio):

```bash
npm install
npm start
```

Abrir **http://localhost:4200**. El archivo `proxy.conf.json`, configurado en Angular, redirige las solicitudes `/api` al backend local. **Ambos procesos deben estar en ejecución.**

> Si el puerto del backend cambia, actualiza también `proxy.conf.json`.

## Configuración de moderación

Archivo `backend/.env` (crear a partir de `.env.example`):

```dotenv
MODERATION_PROVIDER=rules
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:3b
```

- **`rules`**: clasificador determinista local, sin servicios externos ni claves API.
- **`ollama`**: proveedor opcional de análisis contextual mediante un modelo ejecutado localmente. Requiere instalar Ollama, disponer del modelo configurado y tener el servicio en funcionamiento. Por ejemplo, con el modelo usado durante el desarrollo: `ollama pull qwen2.5:3b`.

El proveedor Ollama puede tardar más en procesar los comentarios y también puede producir falsos positivos o negativos. No es necesario para evaluar la aplicación en su configuración predeterminada.

## API

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/moderation/comments` | Lee los 20 comentarios del JSON del backend, los clasifica y devuelve ordenados. |
| `POST` | `/api/moderation/classify` | Clasifica una lista de comentarios enviada por el cliente. |

Ejemplo de solicitud al endpoint de clasificación:

```bash
curl -X POST http://localhost:3000/api/moderation/classify \
  -H 'Content-Type: application/json' \
  -d '[{"id":1,"usuario":"demo","fecha":"2026-11-24","texto":"Eres un tarado","reportes":0}]'
```

> El ejemplo presupone que el endpoint recibe directamente un arreglo JSON, como en la implementación desarrollada. Si el controlador usa un objeto contenedor, ajusta el cuerpo al DTO real antes de publicar.

## Criterios de clasificación

En el proveedor `rules` se aplica el siguiente orden de evaluación:

| Prioridad | Señal | Categoría | Gravedad |
| --- | --- | --- | ---: |
| 1 | Comentario vacío | `revisar` | 2 |
| 2 | Posible amenaza | `revisar` | 5 |
| 3 | Insulto u ofensa | `revisar` | 4 |
| 4 | Posible información de contacto | `revisar` | 3 |
| 5 | Publicidad no solicitada | `spam` | 1 |
| 6 | Señales de enlace sospechoso | `revisar` | 3 |
| 7 | Tres o más reportes | `revisar` | 2 |
| 8 | Sin señales detectadas | `ok` | 0 |

La evaluación se detiene en la primera condición coincidente. Por ello, una amenaza prevalece sobre una promoción o sobre el número de reportes. **Los resultados `revisar` se muestran primero y, entre ellos, se ordenan de mayor a menor gravedad.** La categoría `revisar` indica necesidad de evaluación humana, no una infracción confirmada.

Las reglas distinguen ciertos usos cotidianos de expresiones potencialmente amenazantes (por ejemplo, «Te voy a buscar el libro mañana»), aunque no pueden interpretar correctamente todos los contextos.

## Estructura principal

```text
comment-moderator/
├── backend/
│   ├── data/comentarios.json
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   └── moderation/
│   │       ├── classifiers/rules.classifier.ts
│   │       ├── classifiers/rules.classifier.spec.ts
│   │       ├── providers/ollama.provider.ts
│   │       ├── prompts/moderation.prompt.ts
│   │       ├── dto/comment.dto.ts
│   │       ├── interfaces/classification.interface.ts
│   │       ├── comments.repository.ts
│   │       ├── moderation.controller.ts
│   │       ├── moderation.module.ts
│   │       ├── moderation.service.ts
│   │       └── moderation.service.spec.ts
│   ├── .env.example
│   └── package.json
├── src/app/
│   ├── core/models/comment.model.ts
│   └── features/moderation/
│       ├── data/comment.service.ts
│       ├── utils/normalize-text.ts
│       ├── moderation.ts
│       ├── moderation.html
│       └── moderation.scss
├── proxy.conf.json
├── angular.json
└── package.json
```

El frontend consume los resultados de la API y se ocupa de su presentación, filtros y búsqueda. La lógica de clasificación reside en el backend.

## Pruebas y compilación

**Backend:**

```bash
cd backend
npm test
npm run build
```

En la última ejecución local se aprobaron **24 pruebas en dos archivos**: 20 del clasificador por reglas y 4 del servicio de moderación. Se verificaron amenazas, insultos, spam, enlaces, reportes, casos benignos y ordenamiento por gravedad.

**Frontend** (desde la raíz):

```bash
npm run build
```

La última compilación de Angular y la del backend finalizaron correctamente. La ejecución de las pruebas del frontend no forma parte de la evidencia de las 24 pruebas del backend.

## Decisiones técnicas

- **Backend como fuente de clasificación:** concentra las reglas y evita duplicar lógica de negocio en la interfaz.
- **Proveedor configurable:** permite ejecutar la prueba sin IA externa y explorar una alternativa contextual con Ollama.
- **Reglas explicables:** cada resultado incluye un motivo y una gravedad, útiles para la revisión humana.
- **Signals y `computed`:** mantienen sincronizados los filtros, la búsqueda y las estadísticas del frontend.
- **Pruebas de regresión:** incluyen expresiones adicionales a las presentes en el conjunto original y verifican el ordenamiento.

## Limitaciones y mejoras posibles

El clasificador por reglas es una **heurística**, no un detector exhaustivo. Puede fallar con ironía, variantes del lenguaje, insultos indirectos, amenazas ambiguas y enlaces maliciosos que no presenten señales conocidas. Las listas de acortadores y expresiones sospechosas no sustituyen un servicio de reputación de URLs. El proveedor Ollama también puede equivocarse; durante las pruebas se observó una clasificación incorrecta de una frase cotidiana y se ajustó el prompt.

Para un sistema productivo serían necesarios datos etiquetados, métricas de precisión y cobertura, pruebas de integración, revisión humana, trazabilidad de decisiones, configuración de políticas y medidas adicionales de seguridad. **Los 20 comentarios son datos de demostración y no constituyen un conjunto de evaluación validado.**

## Uso de inteligencia artificial durante el desarrollo

Se utilizó ChatGPT como apoyo para analizar alternativas, revisar código, diseñar pruebas y depurar errores. Se experimentó con un proveedor de OpenAI, pero no pudo utilizarse por una respuesta de cuota insuficiente; posteriormente se integró Ollama como alternativa local opcional. Los cambios se validaron mediante pruebas automatizadas y compilaciones locales. El proyecto funciona de forma predeterminada sin utilizar un modelo de IA durante la clasificación.
