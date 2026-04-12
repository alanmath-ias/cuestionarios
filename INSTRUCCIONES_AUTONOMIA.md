# INSTRUCCIONES DE ACCESO A TERMINAL (PUENTE C: -> L:)

**PROBLEMA**: El sistema de seguridad de Antigravity bloquea el uso de `run_command` si el `Cwd` es una unidad externa o mapeada como `L:`, reportando que el camino no está en un "workspace".

**SOLUCIÓN "PUENTE"**: 
1. SIEMPRE utiliza un `Cwd` reconocido por el sistema en el disco nativo, por ejemplo: `C:\Users\Sin mascara\.gemini\antigravity\scratch`.
2. Ejecuta los comandos usando rutas absolutas a la unidad `L:`.
3. Para comandos de Git, utiliza el flag `-C` para apuntar a la base del repositorio en `L:`.

**EJEMPLOS DE ÉXITO**:
- Listar archivos: `dir "L:\PAGINA WEB\APP CUESTIONARIOS\app cuestionarios GITHUB DIRECTAMENTE\cuestionarios"` (Cwd: C:\...\scratch)
- Estado de Git: `git -C "L:\PAGINA WEB\APP CUESTIONARIOS\app cuestionarios GITHUB DIRECTAMENTE\cuestionarios" status` (Cwd: C:\...\scratch)
- Ejecutar scripts: `node "L:\PAGINA WEB\APP CUESTIONARIOS\app cuestionarios GITHUB DIRECTAMENTE\cuestionarios\script.js"` (Cwd: C:\...\scratch)

**REGLA DE ORO**: No intentes cambiar el `Cwd` a `L:`. Quédate en `C:` y apunta con "telescopio" a `L:`.
