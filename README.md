# 🛡️ Angel Shot &bull; Ruta Segura para Mujeres en el Espacio Público Nocturno

Sistema integral multiplataforma diseñado para la **visibilización colaborativa de puntos de riesgo en el espacio público nocturno** y asistencia discreta ciudadana ante situaciones de vulnerabilidad, acoso o peligro en municipios de Cundinamarca (**Chía, Zipaquirá y Cajicá**), desarrollado bajo la metodología **RUP (Rational Unified Process)**.

---

## 🎯 Solución al Reto: Problema 6
> **Contexto translocal:** La percepción de inseguridad en parques, vías y entornos universitarios es una problemática constante para la ciudadanía en varios municipios de Cundinamarca. Las mujeres enfrentan barreras adicionales de movilidad y seguridad que requieren soluciones de información colaborativa e inmediata.

### Delimitación y Alcance del Sistema
* ✅ **Autenticación con JWT:** Solo usuarias/os autenticadas pueden crear nuevos reportes de riesgo en el sistema.
* ✅ **Formulario de Reporte de Puntos de Riesgo:** Ubicación textual (Municipio precargado: Chía, Zipaquirá, Cajicá + Punto de referencia específico) + Categoría de riesgo (`ACOSO_O_INTIMIDACION`, `ILUMINACION_DEFICIENTE`, `ZONA_DESOLADA`, `ANGEL_SHOT_SOLO`) + Descripción opcional + Fecha/hora automática.
* ✅ **Visualización, Listado y Filtros:** Lista estructurada ordenada por cercanía/municipio con filtros interactivos por tipo de riesgo y municipio.
* ✅ **Integración de Mapas & APIs Gratuitas:** Renderizado interactivo con **Leaflet.js y OpenStreetMap**, popups con información detallada y geocodificación inversa gratuita con la API pública de **BigDataCloud**.
* 🚫 **Fuera de alcance intencional:** No realiza seguimiento en tiempo real (GPS continuo) ni incluye botones de pánico conectados a centrales de policía de emergencia; el valor primordial radica en la visibilización comunitaria y colaborativa.

---

## 🚀 Tecnologías Principales

[![Java 21](https://img.shields.io/badge/Java-21_LTS-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Android Compose](https://img.shields.io/badge/Android-Jetpack_Compose-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://developer.android.com/jetpack/compose)
[![Angular](https://img.shields.io/badge/Angular-17+-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://supabase.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

---

## 🍸 ¿Qué es un "Angel Shot"?

El **Angel Shot** es un código internacional utilizado en bares y discotecas para pedir auxilio discretamente al personal cuando una persona se siente acosada o en peligro:
* 🚶 **Angel Shot Solo ("Neat"):** El personal de seguridad o staff acompaña discretamente a la persona hasta su vehículo o transporte en la salida.
* 🚕 **Angel Shot Con Hielo ("On the rocks"):** El personal solicita un taxi o transporte seguro (Uber/Didi) a nombre de la persona sin levantar sospechas.
* 🚨 **Angel Shot Con Lima ("With lime"):** Situación de riesgo crítico o agresión inminente: intervención inmediata del equipo de seguridad y aviso a las autoridades.

---

## 👥 Actores del Sistema (Metodología RUP)

1. **Usuario / Ciudadano:**
   - Emite alertas rápidas de auxilio en 1 toque.
   - Comparte ubicación precisa o detalle dentro del recinto (ej. *"Mesa 14"*, *"Baño"*).
   - Acceso a **Modo Discreto / Camuflado** (pantalla simulada de notas personales).
   - Consulta el mapa de establecimientos y zonas seguras afiliadas.

2. **Personal de Seguridad / Operador de Campo:**
   - Recibe alertas en tiempo real en su tablero móvil o terminal.
   - Atiende la solicitud presencialmente en el punto exacto.
   - Registra el avance y cierre seguro de la asistencia.

3. **Gestor de Establecimiento / Supervisor:**
   - Monitorea el flujo de incidentes de su local o zona asignada.
   - Asigna operadores según disponibilidad.
   - Configura la información y personal de su local.

4. **Administrador del Sistema:**
   - Gestiona locales afiliados y usuarios globales.
   - Consulta métricas, tiempos de respuesta y estadísticas de seguridad.

---

## 📁 Estructura del Proyecto

El repositorio sigue una arquitectura modular desacoplada:

```
AngelShot/
├── pom.xml                       # Maven Root Aggregator
├── Dockerfile                    # Dockerfile multi-stage para despliegue
├── render.yaml                   # Blueprint de Render (Backend + Web)
├── docker-compose.yml            # Orquestación local de PostgreSQL y Backend
├── .gitignore                    # Reglas de exclusión seguras
│
├── backend/                      # Servidor REST API (Spring Boot 3 + Java 21)
│   ├── pom.xml
│   ├── Dockerfile
│   ├── .env.example              # Plantilla para variables de entorno
│   └── src/
│       ├── main/java/com/angelshot/
│       │   ├── config/           # Seguridad JWT, CORS, OpenAPI Swagger, DataInitializer
│       │   ├── controller/       # Auth, Alertas, Establecimientos, Estadísticas, Health
│       │   ├── dto/              # Objetos de transferencia de datos validados
│       │   ├── entity/           # Modelos JPA (Usuario, Alerta, Establecimiento, etc.)
│       │   ├── exception/        # Manejador global de excepciones
│       │   ├── repository/       # Repositorios Spring Data JPA
│       │   └── service/          # Lógica de negocio y despacho de correos
│       └── main/resources/
│           ├── application.yml   # Configuración parametrizada
│           └── schema.sql        # Definición DDL para PostgreSQL
│
├── frontend/                     # Aplicación Móvil Android (Kotlin + Jetpack Compose)
│   ├── build.gradle.kts          # Configuración raíz de Gradle
│   ├── settings.gradle.kts
│   ├── gradle.properties
│   └── app/
│       ├── build.gradle.kts      # Compose BOM, Retrofit, Navigation
│       └── src/main/
│           ├── AndroidManifest.xml # Permisos de Red, Ubicación y Notificaciones
│           ├── res/              # Recursos, paleta de colores y estilos
│           └── java/com/angelshot/app/
│               ├── data/         # Modelos, ApiClient, TokenManager
│               ├── ui/           # Temas, navegación, pantallas (Home, Tablero, Auth)
│               ├── MainActivity.kt
│               └── AngelShotApplication.kt
│
└── web/                          # Dashboard Web de Monitoreo (Angular 17+)
    ├── package.json
    ├── angular.json
    ├── tsconfig.json
    └── src/
        ├── app/
        │   ├── core/             # Servicios API, modelos e interceptor JWT
        │   └── features/         # Dashboard en tiempo real y métricas
        ├── environments/         # Configuración de URLs para Dev y Producción
        └── index.html
```

---

## ⚙️ Configuración y Variables de Entorno

> [!IMPORTANT]
> Nunca expongas credenciales o tokens en el código. Configura un archivo `.env` o variables en tu entorno de ejecución:

```env
# Base de Datos (PostgreSQL local o Supabase)
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/angelshot_db
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=tu_clave_secreta

# Seguridad JWT
JWT_SECRET=TuClaveSecretaSuperSeguraDe256BitsParaHMACSHA256!
JWT_EXPIRATION_MS=86400000

# Correo y Notificaciones (Opcional - Resend API)
RESEND_API_KEY=re_tu_clave_api_aqui
MAIL_FROM=Angel Shot <onboarding@resend.dev>
```

---

## 🚀 Cómo Ejecutar el Proyecto

### 1. Backend con Docker Compose
```bash
docker-compose up -d
```
La API estará disponible en `http://localhost:8080`, con documentación interactiva en:
* 📖 Swagger UI: `http://localhost:8080/swagger-ui.html`
* 🩺 Health Check: `http://localhost:8080/api/health`

### 2. Frontend Móvil (Android)
1. Abre la carpeta `frontend/` en **Android Studio**.
2. Sincroniza las dependencias con Gradle.
3. Ejecuta en tu dispositivo físico o emulador.

### 3. Frontend Web (Dashboard Angular)
```bash
cd web
npm install
npm start
```
Disponible en `http://localhost:4200`.

---

## 📄 Licencia

Este proyecto es parte del curso de Ingeniería de Software (5to Semestre) bajo la metodología RUP.
