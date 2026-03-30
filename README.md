# FileVault 🔐

**Comparte archivos de forma segura mediante tokens únicos.** Sin registro, sin cuentas, sin dependencias externas.

---

## ✨ Características

- **↑ Subida con límite**: máximo **500 MB** por archivo
- **↓ Descarga ilimitada**: un token puede usarse las veces que quieras
- **🔑 Token automático**: generado al instante en formato `XXXX-XXXX-XXXX`
- **0 dependencias**: solo HTML, CSS y JavaScript puro
- **Sin backend**: demo local, archivos en memoria de sesión

---

## 📁 Archivos del proyecto

```
index.html       → Página principal (subir archivo)
download.html    → Descargar con token (sin límite)
about.html       → Información del proyecto
styles.css       → Estilos globales
vault.js         → Almacenamiento compartido + utilidades
upload.js        → Lógica de subida (límite 500MB)
download.js      → Lógica de descarga (sin límite ✓)
favicon.svg      → Icono de la web
README.md        → Este archivo
```

---

## 🚀 Cómo usarlo

### Subir un archivo
1. Abre `index.html`
2. Arrastra o selecciona tu archivo (máx. 500 MB)
3. Clic en **"Generar token y subir archivo"**
4. Copia el token `XXXX-XXXX-XXXX` y compártelo

### Descargar un archivo
1. Abre `download.html`
2. Introduce el token de acceso
3. Clic en **"Verificar token y descargar"**
4. ¡Sin límite de descargas!

---

## 🌐 GitHub Pages

Activa GitHub Pages en **Settings → Pages → Branch: main → Save**

Tu web quedará en:
`https://charlysaenzx2657-wq.github.io/FileVault`

---

## ⚠️ Nota

Esta es una **demo 100% frontend**. Los archivos se guardan en memoria RAM del navegador y se pierden al cerrar la pestaña. Para uso en producción se necesita un backend con base de datos.

---

## 📄 Licencia

MIT — libre para usar, modificar y distribuir.
