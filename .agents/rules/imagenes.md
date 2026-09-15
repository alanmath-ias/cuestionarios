# Reglas Obligatorias para la Generación de Imágenes

En toda generación de imágenes para cuestionarios (mediante la herramienta `generate_image`), se deben aplicar estrictamente las siguientes directrices:

## 1. Ecuaciones y Contenido Matemático en Un Solo Renglón
- Toda ecuación, función, expresión matemática o igualdad debe estar escrita **estrictamente en un solo renglón horizontal continuo** (`SINGLE CONTINUOUS HORIZONTAL LINE`).
- Queda **estrictamente prohibido partir o dividir una ecuación en varios renglones**.
- Si la imagen incluye un texto de enunciado breve o una incógnita (ej: `$x = ?$`), este puede colocarse en otra línea, pero **la ecuación principal jamás debe fragmentarse**.

## 2. Jerarquía y Prioridad de Soportes
- **Soportes de Alta Prioridad (Habituales y Preferidos)**:
  - **Pizarras**: De tiza verde/negra con trazo claro, y acrílicas blancas con marcadores de color.
  - **Tablets**: Pantallas táctiles digitales en soportes de escritorio con tipografía limpia.
  - **PCs y Monitores**: Pantallas de computadores o portátiles (laptops) en entornos realistas.
  - **Proyecciones**: Video beam proyectado sobre paredes de aulas o telones de conferencias.
  - **Cuadernos**: Escolares o universitarios (cuadriculados o rayados) con apuntes a mano nítidos.
  - **Notas**: Notas adhesivas (post-its) de colores o libretas de notas sobre mesas/escritorios.
  - **Pendones y Carteles**: Banners enrollables (roll-ups), afiches o carteles expositivos.
- **Soportes Secundarios y Ocasionales (Solo de vez en cuando / Esporádicos)**:
  - Tallados en tronco o corteza de árbol.
  - Estampados en prendas (camisetas, sudaderas).
  - Grabados o inscripciones en piedra / roca rústica.
  - Tatuajes artísticos en piel humana.
  *(Estos soportes creativos deben aparecer únicamente de forma infrecuente/ocasional).*

## 3. Buen Contraste Natural y Realista (Sin Exageraciones)
- Mantener un contraste nítido, equilibrado y realista entre la escritura y la superficie.
- **Evitar contrastes extremos, forzados o hiper-saturados** que resten realismo fotográfico a la toma.

## 4. Cláusula Obligatoria en los Prompts de IA
En **todos** los prompts enviados a `generate_image`, incluir:
> `"The text and mathematical formula must be VERY LARGE, BOLD, and PROMINENT, occupying most of the surface area (between 60% and 80% of the visible space). The entire mathematical equation must be written strictly on a SINGLE CONTINUOUS HORIZONTAL LINE, never split, broken, or wrapped across multiple lines. Shot from a clear, close-up, readable frontal or semi-top-down angle with GOOD NATURAL AND REALISTIC CONTRAST between the writing and the background surface (avoiding exaggerated, artificial, or hyper-saturated high contrast to preserve authentic photographic realism). NEVER render small, faint, distant, or tiny lettering."`

## 5. Protocolo Obligatorio ante Agotamiento de Cuota de IA (Rate Limit 429)
Si durante el proceso de generación la herramienta `generate_image` devuelve un error de límite de cuota (HTTP 429 / Resource Exhausted):
1. **Queda estrictamente prohibido generar o sustituir imágenes mediante PowerShell, Python ni ningún script alternativo.**
2. **Informar de inmediato y de forma explícita al usuario** que la cuota de generación de imágenes se ha alcanzado y el tiempo exacto que resta para su restablecimiento.
3. **Proporcionar al usuario los nombres de archivo y sus respectivos prompts en inglés formateados obligatoriamente dentro de bloques de código individuales (` ```text ` o ` ``` `)**:
   - Cada prompt debe presentarse en su propio bloque de código independiente para que la interfaz del chat muestre el botón nativo de **Copiar** con un solo clic y el usuario no tenga que seleccionar texto manualmente.
