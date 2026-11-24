# Bitácora técnica — Comment Moderator

**Proyecto:** Clasificación automática de comentarios de una comunidad
**Tecnologías:** Angular 22, TypeScript, Signals, RxJS, SCSS, NestJS 12, API REST, Vitest y Ollama (opcional).

## 1. Enfoque inicial

Comencé con una aplicación Angular que leía 20 comentarios desde un JSON local y los clasificaba en `ok`, `spam` y `revisar`. Separé las reglas de la interfaz para poder probarlas sin renderizar componentes y utilicé Signals para filtros, búsqueda y estadísticas. El objetivo inicial era construir una solución sencilla, reproducible y explicable.

## 2. Observaciones y evolución de la solución

Durante la revisión técnica, Daniela señaló que algunas reglas parecían ajustadas a las frases exactas del archivo de ejemplo y que era necesario reconocer expresiones nuevas, como «te voy a buscar» en contexto amenazante o «eres un tarado». También solicitó priorizar los comentarios más graves, de modo que las amenazas aparecieran antes que comentarios enviados a revisión únicamente por sus reportes.

A partir de esas observaciones amplié los patrones y los casos de prueba, incorporé niveles de gravedad y ordené los resultados colocando primero la categoría `revisar` y, dentro de ella, los comentarios de mayor gravedad. También corregí casos de insultos dirigidos a grupos, publicidad con enlaces y enlaces informativos que antes se trataban como sospechosos.

## 3. Arquitectura y uso de IA

Tras evaluar la necesidad de una clasificación más contextual, trasladé la lógica de moderación a un backend NestJS. Angular quedó encargado de consumir la API y presentar resultados; el backend centraliza el acceso al JSON, la clasificación y el ordenamiento.

Probé una integración con OpenAI, pero recibí un error de cuota insuficiente. Como alternativa incorporé Ollama con `qwen2.5:3b`, ejecutado localmente. Durante las pruebas, el modelo confundió «Te voy a buscar el libro mañana» con una ofensa; ajusté el prompt para incluir contrastes entre amenazas y expresiones cotidianas. Para garantizar que la prueba funcione sin instalar modelos ni depender de servicios externos, dejé el proveedor de reglas como opción predeterminada y Ollama como alternativa configurable.

Utilicé ChatGPT para explorar alternativas, revisar implementaciones, proponer pruebas y diagnosticar errores. Las sugerencias se contrastaron con ejecución local y resultados observables; no asumí que la IA acertara siempre.

## 4. Dificultades, correcciones y validación

Una dificultad importante fue equilibrar la detección de contenido problemático con los falsos positivos. Por ejemplo, no toda URL representa spam y «te voy a buscar» no siempre constituye una amenaza. Refiné las condiciones de clasificación y añadí pruebas para distinguir algunos de esos contextos.

Implementé **24 pruebas unitarias en el backend**: 20 para el clasificador por reglas y 4 para el servicio, incluyendo ordenamiento de amenazas, insultos y comentarios reportados. La última ejecución terminó con **24 pruebas aprobadas**. También comprobé que tanto NestJS como Angular generaran correctamente sus compilaciones de producción.

## 5. Aprendizajes y mejoras futuras

Este proceso reforzó la importancia de no diseñar reglas únicamente para superar un conjunto fijo de ejemplos. Aprendí a separar la clasificación de la presentación, a probar explícitamente la prioridad de las decisiones y a documentar los límites de un clasificador heurístico y de un modelo local.

Con más tiempo incorporaría un conjunto etiquetado para medir precisión y falsos positivos, revisión humana, auditoría de decisiones, reglas configurables y pruebas de integración de extremo a extremo.

**Conclusión:** la solución evolucionó desde una clasificación local en Angular hacia una arquitectura Angular + NestJS con reglas verificables, priorización por gravedad y un proveedor de IA opcional. El resultado es funcional y reproducible, aunque no pretende resolver todos los casos de moderación real.
