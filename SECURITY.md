# Seguridad

Las correcciones se aplican sobre la versión actual de `master`.

## Reportar una vulnerabilidad

No publiques secretos, datos personales ni instrucciones de explotación en issues o pull requests.

Usá **Security → Report a vulnerability** si el reporte privado está habilitado:
https://github.com/sebamoccagatta/PokedlePlus/security/advisories/new

Si esa opción no está disponible, contactá al mantenedor por un canal privado publicado en su perfil de GitHub. Si no hay un canal, abrí un issue solicitando un medio privado, sin incluir detalles técnicos sensibles.

Incluí descripción, impacto y pasos mínimos de reproducción en un entorno propio. No accedas a datos ajenos ni hagas pruebas de carga contra producción.

## Desarrollo y revisión

- Las contribuciones externas llegan por forks y PR hacia `master`.
- No se comparten credenciales de Neon, Redis, Netlify ni producción.
- Una variable `VITE_*` se publica en el navegador: nunca debe contener secretos.
- CI no usa secretos ni despliega. Los workflows de forks se aprueban manualmente según Settings.
- Revisar especialmente workflows, dependencias, scripts de instalación, acceso a datos y configuración de despliegue.
- Si se filtra un secreto, revocarlo o rotarlo inmediatamente. Borrar el archivo no lo elimina del historial.

La presencia de estos archivos no activa protecciones administrativas. Ver [configuración pendiente](docs/repository-security.md).
