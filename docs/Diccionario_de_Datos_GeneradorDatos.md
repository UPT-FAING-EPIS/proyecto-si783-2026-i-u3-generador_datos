<center>

**UNIVERSIDAD PRIVADA DE TACNA**

**FACULTAD DE INGENIERÍA**

**Escuela Profesional de Ingeniería de Sistemas**

# DICCIONARIO DE DATOS

**PROYECTO: Sistema Generador de Datos Sintéticos con IA**

Curso: Base de Datos II

Docente: Ing. Patrick Cuadros

**Integrantes:**

Ramos Loza, Mariela Estefany (2023077478)

Llanos Niño, Vincenzo Rafael (202307679)

**Tacna – Perú**

**2026**

</center>

---

## ÍNDICE GENERAL

1. [Descripción de la Base de Datos](#1-descripción-de-la-base-de-datos)
2. [Tablas del Sistema](#2-tablas-del-sistema)
   - [2.1. Tabla `usuarios`](#21-tabla-usuarios)
   - [2.2. Tabla `sesiones`](#22-tabla-sesiones)
   - [2.3. Tabla `logs`](#23-tabla-logs)
   - [2.4. Tabla `conexiones`](#24-tabla-conexiones)
   - [2.5. Tabla `comentarios`](#25-tabla-comentarios)
3. [Lenguaje de Definición de Datos (DDL)](#3-lenguaje-de-definición-de-datos-ddl)
4. [Lenguaje de Manipulación de Datos (DML)](#4-lenguaje-de-manipulación-de-datos-dml)

---

## DICCIONARIO DE DATOS

## 1. Descripción de la Base de Datos

El sistema utiliza una base de datos SQLite (archivo: `datagenerator_db.db`) gestionada mediante el ORM **SQLAlchemy**. La arquitectura de datos está organizada en **5 tablas** que cubren la gestión de usuarios, autenticación, auditoría, conexiones a bases de datos externas y retroalimentación de los usuarios.

---

## 2. Tablas del Sistema

---

### 2.1. Tabla `usuarios`

| Campo | Valor |
|---|---|
| **Nombre de la Tabla:** | `usuarios` |
| **Descripción de la Tabla:** | Tabla principal que almacena la información de registro y autenticación de cada usuario del sistema. |
| **Objetivo:** | Gestionar la identidad, credenciales y estado de los usuarios que utilizan la plataforma generadora de datos. |
| **Relaciones con otras tablas:** | Es referenciada por las tablas `sesiones`, `logs`, `conexiones` y `comentarios` a través de la clave foránea `usuario_id`. |

**Descripción de los campos:**

| Nro. | Nombre del Campo | Tipo de dato | ¿Nulos? | PK | FK | Descripción del campo |
|:---:|---|---|:---:|:---:|:---:|---|
| 1 | `id` | INTEGER | No | Sí | No | Identificador único autoincremental del usuario. |
| 2 | `nombre` | VARCHAR(100) | No | No | No | Nombre de pila del usuario. |
| 3 | `apellido` | VARCHAR(100) | No | No | No | Apellido(s) del usuario. |
| 4 | `email` | VARCHAR(255) | No | No | No | Correo electrónico único e indexado para login. |
| 5 | `password_hash` | VARCHAR(255) | Sí | No | No | Hash de la contraseña. Nulo si el acceso es exclusivamente por OAuth. |
| 6 | `rol` | ENUM | No | No | No | Rol en el sistema: `superadmin` o `usuario`. |
| 7 | `activo` | BOOLEAN | No | No | No | Indica si la cuenta está habilitada (True) o suspendida (False). |
| 8 | `avatar_url` | VARCHAR(500) | Sí | No | No | URL a la imagen de perfil del usuario. |
| 9 | `created_at` | DATETIME | No | No | No | Fecha y hora de creación del registro. |
| 10 | `updated_at` | DATETIME | No | No | No | Fecha y hora de la última modificación del registro. |
| 11 | `ultimo_acceso` | DATETIME | Sí | No | No | Fecha y hora del último inicio de sesión exitoso. |
| 12 | `ultima_ip` | VARCHAR(45) | Sí | No | No | Dirección IP del último acceso (soporta IPv4 e IPv6). |

---

### 2.2. Tabla `sesiones`

| Campo | Valor |
|---|---|
| **Nombre de la Tabla:** | `sesiones` |
| **Descripción de la Tabla:** | Registro de las sesiones activas e históricas de los usuarios en el sistema. |
| **Objetivo:** | Controlar y auditar los tokens JWT emitidos, garantizando la seguridad y el control de acceso activo. |
| **Relaciones con otras tablas:** | Referencia a la tabla `usuarios` mediante la clave foránea `usuario_id` con eliminación en cascada (`ON DELETE CASCADE`). |

**Descripción de los campos:**

| Nro. | Nombre del Campo | Tipo de dato | ¿Nulos? | PK | FK | Descripción del campo |
|:---:|---|---|:---:|:---:|:---:|---|
| 1 | `id` | INTEGER | No | Sí | No | Identificador único autoincremental de la sesión. |
| 2 | `usuario_id` | INTEGER | No | No | Sí → `usuarios.id` | ID del usuario propietario de la sesión. |
| 3 | `token_jwt` | TEXT | No | No | No | Token JWT emitido para autenticar las peticiones del usuario. |
| 4 | `ip_address` | VARCHAR(45) | Sí | No | No | Dirección IP desde donde se inició la sesión. |
| 5 | `metodo_login` | ENUM | No | No | No | Método de autenticación: `email`, `google`, `github` o `microsoft`. |
| 6 | `activa` | BOOLEAN | No | No | No | Indica si el token de sesión sigue siendo válido. |
| 7 | `created_at` | DATETIME | No | No | No | Fecha y hora de creación de la sesión. |
| 8 | `expires_at` | DATETIME | No | No | No | Fecha y hora de expiración del token JWT. |

---

### 2.3. Tabla `logs`

| Campo | Valor |
|---|---|
| **Nombre de la Tabla:** | `logs` |
| **Descripción de la Tabla:** | Tabla de auditoría que registra todas las acciones significativas realizadas dentro del sistema. |
| **Objetivo:** | Proveer un historial trazable de operaciones para fines de seguridad, depuración y monitoreo del sistema. |
| **Relaciones con otras tablas:** | Referencia a la tabla `usuarios` mediante `usuario_id`. En caso de eliminación del usuario el campo se pone en `NULL` (`ON DELETE SET NULL`). |

**Descripción de los campos:**

| Nro. | Nombre del Campo | Tipo de dato | ¿Nulos? | PK | FK | Descripción del campo |
|:---:|---|---|:---:|:---:|:---:|---|
| 1 | `id` | INTEGER | No | Sí | No | Identificador único autoincremental del registro de log. |
| 2 | `usuario_id` | INTEGER | Sí | No | Sí → `usuarios.id` | ID del usuario que realizó la acción. Puede ser nulo para acciones del sistema. |
| 3 | `accion` | VARCHAR(100) | No | No | No | Nombre corto y descriptivo de la acción ejecutada. |
| 4 | `detalle` | TEXT | Sí | No | No | Información técnica adicional o descripción extendida del evento. |
| 5 | `ip_address` | VARCHAR(45) | Sí | No | No | Dirección IP desde la cual se realizó la acción registrada. |
| 6 | `nivel` | VARCHAR(20) | No | No | No | Nivel de severidad del evento: `INFO`, `WARNING` o `ERROR`. |
| 7 | `created_at` | DATETIME | No | No | No | Fecha y hora exacta en que se registró el evento. |

---

### 2.4. Tabla `conexiones`

| Campo | Valor |
|---|---|
| **Nombre de la Tabla:** | `conexiones` |
| **Descripción de la Tabla:** | Historial y configuración de las bases de datos externas a las que cada usuario se ha conectado para inyectar datos sintéticos. |
| **Objetivo:** | Almacenar de forma segura las credenciales de acceso a bases de datos externas y llevar estadísticas de uso de la herramienta de inyección. |
| **Relaciones con otras tablas:** | Referencia a la tabla `usuarios` mediante `usuario_id` con eliminación en cascada (`ON DELETE CASCADE`). |

**Descripción de los campos:**

| Nro. | Nombre del Campo | Tipo de dato | ¿Nulos? | PK | FK | Descripción del campo |
|:---:|---|---|:---:|:---:|:---:|---|
| 1 | `id` | INTEGER | No | Sí | No | Identificador único autoincremental de la conexión. |
| 2 | `usuario_id` | INTEGER | No | No | Sí → `usuarios.id` | ID del usuario propietario de esta configuración de conexión. |
| 3 | `nombre_alias` | VARCHAR(100) | Sí | No | No | Nombre amigable o alias asignado por el usuario a esta conexión. |
| 4 | `motor_bd` | VARCHAR(50) | No | No | No | Motor de base de datos destino: `mysql`, `postgresql`, `mongodb`, etc. |
| 5 | `host` | VARCHAR(255) | No | No | No | Dirección del servidor de base de datos (IP o dominio). |
| 6 | `puerto` | INTEGER | No | No | No | Puerto de conexión al servidor de base de datos. |
| 7 | `nombre_bd` | VARCHAR(255) | No | No | No | Nombre de la base de datos a la que se realiza la conexión. |
| 8 | `usuario_db` | VARCHAR(255) | Sí | No | No | Nombre de usuario con acceso a la base de datos externa. |
| 9 | `password_db` | TEXT | Sí | No | No | Contraseña cifrada con Fernet para la base de datos externa. |
| 10 | `registros_generados` | INTEGER | No | No | No | Contador total de registros sintéticos generados para esta conexión. |
| 11 | `registros_insertados` | INTEGER | No | No | No | Contador total de registros efectivamente insertados en la BD externa. |
| 12 | `created_at` | DATETIME | No | No | No | Fecha y hora en que se creó este perfil de conexión. |

---

### 2.5. Tabla `comentarios`

| Campo | Valor |
|---|---|
| **Nombre de la Tabla:** | `comentarios` |
| **Descripción de la Tabla:** | Tabla de retroalimentación donde los usuarios pueden dejar reseñas y calificaciones sobre el sistema. |
| **Objetivo:** | Recolectar el feedback de los usuarios para medir la satisfacción y orientar mejoras futuras en la plataforma. |
| **Relaciones con otras tablas:** | Referencia a la tabla `usuarios` mediante `usuario_id` con eliminación en cascada (`ON DELETE CASCADE`). |

**Descripción de los campos:**

| Nro. | Nombre del Campo | Tipo de dato | ¿Nulos? | PK | FK | Descripción del campo |
|:---:|---|---|:---:|:---:|:---:|---|
| 1 | `id` | INTEGER | No | Sí | No | Identificador único autoincremental del comentario. |
| 2 | `usuario_id` | INTEGER | No | No | Sí → `usuarios.id` | ID del usuario que publicó el comentario. |
| 3 | `contenido` | VARCHAR(500) | No | No | No | Texto del comentario o reseña del usuario (máx. 500 caracteres). |
| 4 | `calificacion` | INTEGER | Sí | No | No | Puntuación del sistema en escala del 1 al 5 (opcional). |
| 5 | `created_at` | DATETIME | No | No | No | Fecha y hora en que se publicó el comentario. |
| 6 | `updated_at` | DATETIME | No | No | No | Fecha y hora de la última edición del comentario. |

---

## 3. Lenguaje de Definición de Datos (DDL)

A continuación se presenta el script de creación de las tablas del modelo, compatible con SQLite:

```sql
-- ============================================================
-- DDL - SISTEMA GENERADOR DE DATOS SINTÉTICOS
-- Motor: SQLite / SQLAlchemy ORM
-- Archivo de base de datos: datagenerator_db.db
-- ============================================================

-- TABLA: usuarios
CREATE TABLE usuarios (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre        VARCHAR(100) NOT NULL,
    apellido      VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    rol           VARCHAR(20)  NOT NULL DEFAULT 'usuario',
    activo        BOOLEAN      NOT NULL DEFAULT 1,
    avatar_url    VARCHAR(500),
    created_at    DATETIME     DEFAULT (CURRENT_TIMESTAMP),
    updated_at    DATETIME     DEFAULT (CURRENT_TIMESTAMP),
    ultimo_acceso DATETIME,
    ultima_ip     VARCHAR(45)
);

-- TABLA: sesiones
CREATE TABLE sesiones (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id   INTEGER  NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token_jwt    TEXT     NOT NULL,
    ip_address   VARCHAR(45),
    metodo_login VARCHAR(20) NOT NULL DEFAULT 'email',
    activa       BOOLEAN  NOT NULL DEFAULT 1,
    created_at   DATETIME DEFAULT (CURRENT_TIMESTAMP),
    expires_at   DATETIME NOT NULL
);

-- TABLA: logs
CREATE TABLE logs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id  INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    accion      VARCHAR(100) NOT NULL,
    detalle     TEXT,
    ip_address  VARCHAR(45),
    nivel       VARCHAR(20) NOT NULL DEFAULT 'INFO',
    created_at  DATETIME DEFAULT (CURRENT_TIMESTAMP)
);

-- TABLA: conexiones
CREATE TABLE conexiones (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id           INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre_alias         VARCHAR(100),
    motor_bd             VARCHAR(50) NOT NULL,
    host                 VARCHAR(255) NOT NULL,
    puerto               INTEGER NOT NULL,
    nombre_bd            VARCHAR(255) NOT NULL,
    usuario_db           VARCHAR(255),
    password_db          TEXT,
    registros_generados  INTEGER NOT NULL DEFAULT 0,
    registros_insertados INTEGER NOT NULL DEFAULT 0,
    created_at           DATETIME DEFAULT (CURRENT_TIMESTAMP)
);

-- TABLA: comentarios
CREATE TABLE comentarios (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id   INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    contenido    VARCHAR(500) NOT NULL,
    calificacion INTEGER,
    created_at   DATETIME DEFAULT (CURRENT_TIMESTAMP),
    updated_at   DATETIME DEFAULT (CURRENT_TIMESTAMP)
);
```

---

## 4. Lenguaje de Manipulación de Datos (DML)

### 4.1. Inserción de datos de ejemplo

Se muestran sentencias de inserción de ejemplo para poblar las tablas del sistema con datos de prueba representativos:

```sql
-- ============================================================
-- DML - INSERCIÓN DE DATOS DE EJEMPLO
-- ============================================================

-- Inserción en usuarios
INSERT INTO usuarios (nombre, apellido, email, password_hash, rol, activo) VALUES
    ('Mariela', 'Ramos Loza',   'mariela.ramos@upt.edu.pe',  'hashed_pw_1', 'superadmin', 1),
    ('Vincenzo', 'Llanos Niño', 'vincenzo.llanos@upt.edu.pe', 'hashed_pw_2', 'usuario',    1);

-- Inserción en sesiones
INSERT INTO sesiones (usuario_id, token_jwt, ip_address, metodo_login, activa, expires_at) VALUES
    (1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', '192.168.1.10', 'email',  1, '2026-07-10 00:00:00'),
    (2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', '192.168.1.11', 'google', 1, '2026-07-10 00:00:00');

-- Inserción en logs
INSERT INTO logs (usuario_id, accion, detalle, nivel) VALUES
    (1, 'LOGIN',         'Inicio de sesión exitoso',                          'INFO'),
    (2, 'GENERATE_DATA', 'Generación de 100 registros para tabla clientes',   'INFO'),
    (1, 'INJECT_DATA',   'Inyección en BD externa: mydb@localhost:3306',       'INFO');

-- Inserción en conexiones
INSERT INTO conexiones (usuario_id, nombre_alias, motor_bd, host, puerto, nombre_bd, usuario_db, password_db, registros_generados, registros_insertados) VALUES
    (1, 'Mi MySQL Local', 'mysql',      'localhost',    3306, 'ventas_db',   'root',     'cifrado_fernet...', 200, 200),
    (2, 'Postgres UPT',   'postgresql', 'db.upt.edu.pe', 5432, 'proyecto_db', 'vincenzo', 'cifrado_fernet...', 150, 150);

-- Inserción en comentarios
INSERT INTO comentarios (usuario_id, contenido, calificacion) VALUES
    (1, 'Excelente herramienta, me ahorro horas de trabajo manual generando datos de prueba.', 5),
    (2, 'Muy util para el proyecto de BD. La integracion con IA es increible.', 5);
```

---

*Este documento es parte de la documentación formal del proyecto académico desarrollado en la Universidad Privada de Tacna – 2026.*
