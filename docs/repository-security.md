# Activación de protecciones por el propietario

## Estado

Este PR prepara archivos; no cambia Settings, accesos, secretos ni Netlify. Hasta fusionarlo y activar las reglas, master sigue sin estas protecciones. No invitar colaboradores con escritura durante la configuración.

## Orden de activación

1. Revisar los archivos de este PR. Antes de ejecutar código externo, revisar también sus workflows y scripts de instalación.
2. Fusionar el PR inicial cuando CI esté verde. No hay todavía CODEOWNERS en la rama base para proteger este primer PR.
3. En Settings → Rules → Rulesets → New ruleset → Import a ruleset, importar los dos JSON de docs/rulesets. Descargar los archivos desde GitHub. Confirmar estado Active y rama master.
4. En master - PR, CI e integridad, comprobar que Tests and build es el check de este workflow y seleccionar GitHub Actions como origen esperado si la interfaz lo ofrece. No dejar bypass en esta regla.
5. En master - revisión del propietario, permitir bypass SOLO a Repository admin y SOLO For pull requests only. En este repositorio personal el administrador es el propietario. No agregar Write, Maintain, Apps ni Dependabot. Esta excepción permite al propietario fusionar sus propios PR sin autoaprobarse, pero no saltea CI ni integridad porque están en otra regla.
6. Verificar con un PR pequeño: CI aparece, las conversaciones deben resolverse y un aporte externo exige aprobación del CODEOWNER. Confirmar que nuevos commits anulan aprobaciones. Un push directo o force push a master debe rechazarse. No probar borrando la rama.

## Accesos

- Contribuciones públicas mediante fork → rama → PR. No invitar usuarios como colaboradores para que puedan aportar.
- No otorgar acceso a Netlify, Neon, Redis ni tokens personales.
- Mantener 2FA o passkeys en la cuenta del propietario y revisar sesiones, tokens y aplicaciones.
- Revisar y quitar accesos existentes que no sean necesarios desde Settings → Collaborators. Este PR no inspecciona ni modifica esa lista.

## Actions

En Settings → Actions → General:

- Workflow permissions: Read repository contents and packages permissions.
- Desactivar Allow GitHub Actions to create and approve pull requests.
- Fork pull request workflows: Require approval for all outside collaborators.
- Limitar acciones a las necesarias. Este workflow usa actions/checkout y actions/setup-node fijadas a SHA; no usa pull_request_target.
- Nunca incorporar secretos ni permisos de escritura al job que ejecuta aportes externos.
- Mantener auto-merge desactivado; revisar manualmente PR de Dependabot.
- CI usa runners hospedados por GitHub, nunca runners propios con acceso a redes privadas.

## Code security / Secret protection

En Settings, habilitar las opciones disponibles para:

- Dependency graph, Dependabot alerts y Dependabot security updates.
- Secret scanning, push protection y private vulnerability reporting.
- Code scanning con CodeQL, Default setup, JavaScript/TypeScript. Revisar primer resultado y resolver hallazgos. No se marca como configurado por este PR.
- Revisar alertas existentes. La detección de secretos no encuentra todos los formatos; si hay exposición, rotar las credenciales.

## Netlify y datos

Antes de ejecutar previews externos:

- Desactivar previews automáticos de PR no confiables o exigir aprobación previa del propietario.
- Revisar permisos y política de builds de forks en el panel de Netlify.
- Credenciales de producción solo en contexto production, sin heredarlas en deploy-preview ni branch-deploy. Revisar todas las variables existentes, incluyendo valores compartidos para todos los contextos.
- Si se necesitan previews funcionales, usar Neon y Redis independientes, con datos de prueba y permisos mínimos. No entregar esas credenciales a CI de forks.
- Producción debe desplegar desde master. No conceder permisos de despliegue a contribuidores.

## Contribución y licencia

Revisar CONTRIBUTING y SECURITY. Definir una licencia explícita antes de aceptar contribuciones sustanciales; este PR no cambia derechos de uso ni asigna una licencia.

## Límites

.gitignore solo previene incorporaciones futuras: no elimina secretos ya versionados ni revisa todo el historial. Dependabot y CodeQL no garantizan ausencia de vulnerabilidades. Los rulesets se aplican al activarlos en Settings; CODEOWNERS por sí solo solo solicita revisión.
