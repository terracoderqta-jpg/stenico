FROM eclipse-temurin:25-jre
WORKDIR /app
COPY backend/target/backend-0.0.1-SNAPSHOT.jar app.jar
ENV SQLITE_DB_PATH=./stenico.db
ENV JAVA_OPTS="-Xmx256m"
EXPOSE 8080
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar 2>&1"]