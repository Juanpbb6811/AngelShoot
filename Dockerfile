# =======================================================================
# Dockerfile Raíz para despliegue automatizado en Render / Docker
# =======================================================================

# ETAPA 1: Construcción (Maven + JDK 21 Alpine)
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copiar pom.xml del backend y descargar dependencias
COPY backend/pom.xml pom.xml
RUN mvn dependency:go-offline -B

# Copiar código fuente y compilar
COPY backend/src src
RUN mvn clean package -DskipTests -B

# ETAPA 2: Ejecución Liviana (JRE 21 Alpine)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=build /app/target/*.jar app.jar

ENV PORT=10000
ENV SPRING_PROFILES_ACTIVE=prod

EXPOSE 10000

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
