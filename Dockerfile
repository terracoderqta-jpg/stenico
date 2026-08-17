FROM eclipse-temurin:21-jre
WORKDIR /app
COPY backend/target/backend-0.0.1-SNAPSHOT.jar app.jar
ENV SQLITE_DB_PATH=/data/stenico.db
ENV JAVA_OPTS="-Xmx256m"
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
