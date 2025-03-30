# Use official Tomcat image
FROM tomcat:9.0-jdk21-corretto

# Set working directory in container
WORKDIR /usr/local/tomcat/webapps/

# Copy the WAR file into Tomcat webapps directory
COPY target/Password_Manager_Backend_war_exploded.war ./ROOT.war

# Expose port 8080
EXPOSE 8080

# Start Tomcat server
CMD ["catalina.sh", "run"]
