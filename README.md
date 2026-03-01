
# 🛰️ RRNET Manager - Guía de Instalación en TrueNAS

Este proyecto es una aplicación web estática diseñada para gestionar micro-ISPs. Al usar GitHub, puedes actualizar la aplicación en tu servidor TrueNAS con un solo comando.

## 🚀 Pasos para Instalar (Primera Vez)

### 1. Crear el Repositorio en GitHub
1. Ve a [github.com](https://github.com) y crea un nuevo repositorio llamado `rrnet-manager`.
2. En tu computadora local, dentro de la carpeta del proyecto, ejecuta:
   ```bash
   git init
   git add .
   git commit -m "Primer despliegue RRNET"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/rrnet-manager.git
   git push -u origin main
   ```

### 2. Configurar en TrueNAS (Shell)
Entra por SSH a tu TrueNAS o usa el Shell de la interfaz web:
1. Ve a tu pool de almacenamiento: `cd /mnt/TU_POOL/TU_DATASET`
2. Clona el repositorio:
   ```bash
   git clone https://github.com/TU_USUARIO/rrnet-manager.git app
   cd app
   ```

### 3. Levantar con Docker
Si usas **TrueNAS SCALE**:
```bash
docker-compose up -d
```
La app estará disponible en: `http://IP_DE_TU_TRUENAS:8080`

---

## 🔄 Cómo Actualizar
Cuando yo (tu asistente IA) haga cambios y tú los subas a GitHub, solo tienes que hacer esto en tu TrueNAS:

1. Entra a la carpeta: `cd /mnt/TU_POOL/TU_DATASET/app`
2. Descarga lo nuevo:
   ```bash
   git pull origin main
   ```
*Nginx detectará los cambios automáticamente sin necesidad de reiniciar el contenedor.*

---

## 🔑 Nota sobre la API KEY
Para que la Inteligencia Artificial funcione en tu servidor:
1. Abre el archivo `services/aiService.ts`.
2. Busca la línea `const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });`.
3. Reemplaza `process.env.API_KEY` por tu llave real entre comillas, ej: `"AIzaSy...your_key"`.
4. **IMPORTANTE**: Si el repo es público, no subas este cambio. Usa un archivo `.env` o mantén el repo privado.
