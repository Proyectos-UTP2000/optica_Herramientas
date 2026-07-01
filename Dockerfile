FROM eclipse-temurin:22-jdk AS build

WORKDIR /app

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw

COPY src/ src/

RUN ./mvnw -q -DskipTests package

FROM eclipse-temurin:22-jre

WORKDIR /app

COPY --from=build /app/target/optica-*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
