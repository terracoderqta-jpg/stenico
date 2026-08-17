FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY backend/mvnw backend/mvnw
COPY backend/.mvn backend/.mvn
COPY backend/pom.xml backend/pom.xml
COPY backend/src backend/src
RUN cd backend && sed -i 's/\r$//' mvnw && chmod +x mvnw && ./mvnw -q -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/backend/target/backend-0.0.1-SNAPSHOT.jar app.jar
ENV SQLITE_DB_PATH=/data/stenico.db
ENV JAVA_OPTS="-Xmx256m"
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
