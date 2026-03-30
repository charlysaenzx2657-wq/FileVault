# FileVault 🔐

![FileVault Preview](assets/og-preview.svg)

**Comparte archivos de forma segura mediante tokens únicos.** Sin registro, sin cuentas, sin dependencias externas.

---

## ✨ Características

- **↑ Subida con límite**: máximo **500 MB** por archivo
- **↓ Descarga ilimitada**: un token puede usarse las veces que quieras
- **🔑 Token automático**: generado al instante en formato `XXXX-XXXX-XXXX`
- **0 dependencias**: solo HTML, CSS y JavaScript puro
- **Sin backend**: demo local, archivos en memoria de sesión

---

## 📁 Estructura del proyecto

```
filevault/
├── index.html           # Página principal (subir archivo)
├── README.md
├── pages/
│   ├── download.html    # Descargar con token
│   └── about.html       # Información y documentación
├── css/
│   └── styles.css       # Estilos globales
├── js/
│   ├── vault.js         # Almacenamiento en memoria compartido
│   ├── upload.js        # Lógica de subida
│   └── download.js      # Lógica de descarga (sin límite)
└── assets/
    ├── favicon.svg
    └── og-preview.svg
```

---

## 🚀 Cómo usarlo

### Subir un archivo
1. Abre `index.html` en tu navegador
2. Arrastra o selecciona tu archivo (máx. 500 MB)
3. Haz clic en **"Generar token y subir archivo"**
4. Copia el token generado (`XXXX-XXXX-XXXX`) y compártelo

### Descargar un archivo
1. Abre `pages/download.html`
2. Introduce el token de acceso
3. Haz clic en **"Verificar token y descargar"**
4. ¡Sin límite de descargas!

---

## ⚙️ Tecnologías

| Tecnología | Uso |
|---|---|
| HTML5 | Estructura semántica, FileReader API |
| CSS3 | Variables, Grid, animaciones CSS |
| JavaScript ES6+ | Lógica, Clipboard API, base64 |

---

## ⚠️ Limitaciones (demo local)

> Esta es una **demo 100% frontend**. Los archivos se almacenan en memoria RAM del navegador (objeto `window._fileVault`).
> - Los archivos **se pierden al cerrar la pestaña**
> - Los tokens **no persisten** entre sesiones
> - Para uso en producción se necesita un backend (Node.js, Python, etc.) con base de datos real

---

## 📦 Instalación / despliegue

No requiere instalación. Clona el repositorio y abre `index.html`:

```bash
git clone https://github.com/tu-usuario/filevault.git
cd filevault
# Abre index.html en tu navegador
```

Para despliegue estático puedes usar **GitHub Pages**, **Netlify** o **Vercel** directamente.

---

## 📄 Licencia

MIT — libre para usar, modificar y distribuir.
