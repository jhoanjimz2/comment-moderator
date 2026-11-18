# Bitácora técnica — Comment Moderator

**Proyecto:** Clasificación automática de comentarios  
**Tecnologías:** Angular 22, TypeScript, Signals, RxJS, SCSS y Vitest.

## 1. Enfoque y desarrollo

Desarrollé una aplicación web que procesa 20 comentarios desde un archivo JSON y los clasifica en tres categorías: `ok`, `spam` y `revisar`.

Separé la lógica de clasificación de la interfaz Angular mediante funciones TypeScript independientes. Utilicé un servicio HTTP para obtener los datos, Signals para administrar los filtros y estadísticas, y SCSS para construir una interfaz responsive.

Elegí reglas deterministas porque permiten obtener resultados rápidos, reproducibles y fáciles de explicar, sin depender de servicios externos.

## 2. Uso de inteligencia artificial

Utilicé ChatGPT como herramienta de apoyo para analizar alternativas de implementación, revisar código, proponer casos de prueba y diagnosticar errores.

No integré IA como motor de clasificación porque consideré más apropiado resolver primero los requisitos con una solución sencilla y verificable.

Las sugerencias de IA no se incorporaron sin validación: ejecuté pruebas unitarias y compilaciones para comprobar su comportamiento y realicé correcciones cuando fue necesario.

## 3. Dificultades y correcciones

Uno de los principales desafíos fue evitar clasificaciones incorrectas en comentarios ambiguos.

Por ejemplo, una URL de YouTube contenía el carácter `?` como parte de sus parámetros, lo que inicialmente provocaba que el sistema interpretara el comentario como una pregunta y lo enviara a revisión. Corregí la regla para distinguir las URL de las preguntas reales.

También ajusté la detección de promociones repetitivas y números telefónicos escritos con espacios.

Durante las pruebas identifiqué una inconsistencia en los totales esperados. Revisé los 20 comentarios individualmente y corregí los valores de referencia.

## 4. Validación y aprendizajes

Implementé 16 pruebas unitarias con Vitest, incluyendo validaciones de los 20 comentarios originales.

El resultado final fue de 9 comentarios `ok`, 4 `spam` y 7 `revisar`, de acuerdo con los criterios definidos.

Este ejercicio reforzó la importancia de diseñar reglas explicables, contemplar falsos positivos y validar los resultados con datos reales.

## 5. Mejoras futuras

En una siguiente versión incorporaría revisión manual de comentarios, un historial de decisiones y un servicio de IA para analizar casos ambiguos.

También ampliaría las pruebas y permitiría ajustar los criterios de moderación sin modificar directamente el código.

**Conclusión:** prioricé una solución funcional, mantenible, verificable y proporcional al alcance de la prueba técnica.
