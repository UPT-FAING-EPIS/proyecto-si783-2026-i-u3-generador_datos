# Sistema Híbrido Generador de Datos Sintéticos con IA

Este repositorio contiene el ecosistema completo del **Generador de Datos Sintéticos**, una herramienta impulsada por IA (Gemini) y Faker que permite crear datos realistas para bases de datos, con una arquitectura escalable en distintas plataformas.

## 📁 Contenido del Repositorio

El proyecto está dividido en tres módulos principales y una sección de documentación:

1. **[telegram-bot](./telegram-bot)**: Bot de Telegram interactivo que permite a los usuarios generar, previsualizar y descargar datos sintéticos directamente desde la aplicación de mensajería.
2. **[data-generator-vscode](./data-generator-vscode)**: Extensión para Visual Studio Code que permite generar datos sintéticos sin salir de tu entorno de desarrollo.
3. **[skill-generador-datos](./skill-generador-datos)**: Paquete Python central y servidor MCP que expone la lógica principal de generación (Faker + IA) para ser consumida como una "Skill" o integrada en otros flujos.
4. **[docs](./docs)**: Carpeta que contiene toda la documentación formal del proyecto (Factibilidad, Visión, Requerimientos, Arquitectura, Proyecto Final).
5. **[VIDEO](./VIDEO)**: Contiene la referencia visual al video demostrativo del sistema.

---

## 🎥 Video Demostrativo

Puedes ver el funcionamiento de los distintos módulos y el proyecto completo en el siguiente enlace:
👉 **[Ver Video Demostrativo en Google Drive](https://drive.google.com/drive/folders/11N35gG31Ppkcus1bHSuAi7qDCNGbsDtm?usp=sharing)**

*(También puedes encontrar este enlace en la carpeta `VIDEO/` del repositorio).*

---

## 📖 Documentación (Enlaces Directos)

A continuación, los accesos directos a los documentos del proyecto en formato Markdown (los originales en formato `.docx` también se encuentran en la misma carpeta):

* 📄 **[FD01 - Informe de Factibilidad](./docs/FD01_Informe_Factibilidad_Generador_Datos.md)**
* 📄 **[FD02 - Informe de Visión](./docs/FD02_Informe_Vision_Generador_Datos.md)**
* 📄 **[FD03 - Especificación de Requerimientos (SRS)](./docs/FD03_Informe_SRS_Generador_Datos.md)**
* 📄 **[FD04 - Arquitectura de Software](./docs/FD04_Informe_Arquitectura_GeneradorDatos.md)**
* 📄 **[FD05 - Informe del Proyecto Final](./docs/FD05_Informe_Proyecto_Generador_Datos.md)**

---

## 🚀 Cómo Correr y Utilizar Cada Módulo

### 1. Telegram Bot (`/telegram-bot`)
Este bot funciona como una interfaz conversacional para la generación de datos.
- **Requisitos:** Python 3.10+, un token de BotFather, y una clave de API de Gemini.
- **Cómo usarlo:**
  1. Entra a la carpeta: `cd telegram-bot`
  2. Instala dependencias: `pip install -r requirements.txt`
  3. Configura tus variables de entorno en el archivo `.env` (Telegram Token y Gemini API Key).
  4. Ejecuta el bot: `python bot.py` (o el archivo principal de ejecución).
  5. Abre Telegram, busca tu bot y usa el comando `/start` o envíale un esquema.

### 2. Extensión de VS Code (`/data-generator-vscode`)
Permite insertar datos de prueba directamente en el editor.
- **Requisitos:** Node.js, npm, y Visual Studio Code.
- **Cómo usarlo:**
  1. Entra a la carpeta: `cd data-generator-vscode`
  2. Instala dependencias: `npm install`
  3. Para probarlo localmente, abre la carpeta en VS Code y presiona `F5` para lanzar el modo de depuración de extensiones.
  4. Para empaquetar, puedes usar `vsce package` e instalar el `.vsix` generado directamente en tu editor.

### 3. Skill Python / Servidor MCP (`/skill-generador-datos`)
Es el motor principal que puedes importar en tus scripts o correr como servidor MCP.
- **Requisitos:** Python 3.10+
- **Cómo usarlo (como script):**
  1. Entra a la carpeta: `cd skill-generador-datos`
  2. Instala las dependencias: `pip install -r requirements.txt`
  3. Puedes ejecutar los scripts de prueba locales (como `prueba_skill.py`) para interactuar con la lógica principal en la terminal.
- **Cómo usarlo (como Servidor MCP):**
  1. Ejecuta el archivo del servidor MCP (ej. `python mcp_server.py`) y configura tu cliente (como Claude Desktop) para que consuma la herramienta.
