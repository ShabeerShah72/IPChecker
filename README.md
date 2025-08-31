# 🌐 IP Checker

A modern web application that allows users to check IP address details and prevents duplicate lookups with automatic data cleanup.


## ✨ Features

- **🔍 IP Address Lookup**: Get detailed information about any IP address
- **🚫 Duplicate Prevention**: Automatically detects and prevents duplicate IP lookups
- **🗑️ Auto Cleanup**: Automatically removes IP records older than 10 days
- **📱 Responsive Design**: Works perfectly on desktop and mobile devices
- **⚡ Fast Performance**: Built with Spring Boot and optimized database queries
- **🛡️ Input Validation**: Comprehensive IP address format validation
- **📊 Real-time Feedback**: Instant results and error handling

## 🖥️ Demo

**Frontend**: Modern, responsive interface with glassmorphism design
**Backend**: RESTful API with automatic data management

### What you can check:
- Country, Region, City
- ISP and Organization
- Timezone and Currency
- Latitude and Longitude
- Security status

## 🚀 Quick Start

### Prerequisites

- Java 17 or higher
- Maven 3.6+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ip-checker.git
   cd ip-checker
   ```

2. **Run the backend**
   ```bash
   ./mvnw clean install
   ./mvnw spring-boot:run
   ```

3. **Access the application**
   - Backend API: `http://localhost:8080`
   - Frontend: Open `index.html` in your browser or serve it locally

## 🏗️ Project Structure

```
ip-checker/
├── src/
│   └── main/
│       ├── java/com/ipchecker/
│       │   ├── IPCheckerApplication.java     # Main Spring Boot application
│       │   ├── controller/
│       │   │   └── IPController.java         # REST API endpoints
│       │   ├── service/
│       │   │   └── IPService.java           # Business logic & cleanup
│       │   ├── repository/
│       │   │   └── IPRepository.java        # Database operations
│       │   └── model/
│       │       └── IPLog.java               # IP entity model
│       └── resources/
│           └── application.properties        # Configuration
├── frontend/
│   ├── index.html                           # Main HTML file
│   ├── style.css                           # Responsive CSS
│   └── script.js                           # Frontend JavaScript
├── pom.xml
├── Dockerfile
├── .dockerignore
├── .gitignore
├── railways.toml                                 # Maven dependencies
└── README.md
```

## 🔧 Configuration

### Database Configuration

**Development (H2 In-Memory)**:
```properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
```

**Production (PostgreSQL)**:
```properties
spring.datasource.url=${DATABASE_URL}
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

### Cleanup Configuration

The application automatically cleans up IP records older than 10 days:
- **Schedule**: Daily at 2:00 AM
- **Retention**: 10 days
- **Method**: Batch deletion with transaction safety

To modify cleanup settings, edit `IPService.java`:
```java
@Scheduled(cron = "0 0 2 * * *") // Change time here
LocalDateTime cutoffDate = LocalDateTime.now().minusDays(10); // Change days here
```

## 🌐 API Endpoints

### Check IP Address
```http
POST /api/check-ip
Content-Type: application/json

{
  "ip": "8.8.8.8"
}
```

**Response (New IP)**:
```json
{
  "duplicate": false,
  "country": "United States",
  "city": "Mountain View",
  "isp": "Google LLC",
  "timezone": "America/Los_Angeles",
  "lat": 37.4056,
  "lon": -122.0775
}
```

**Response (Duplicate IP)**:
```json
{
  "duplicate": true
}
```

### Manual Cleanup
```http
GET /api/cleanup
```

**Response**:
```json
{
  "success": true,
  "deletedCount": 150,
  "message": "Manual cleanup completed successfully"
}
```

### Health Check
```http
GET /api/health
```

**Response**:
```json
{
  "status": "OK",
  "service": "IP Checker API"
}
```

## 🚀 Deployment

### Option 1: Railway (Recommended)
1. Push code to GitHub
2. Connect to [Railway](https://railway.app)
3. Add PostgreSQL database
4. Deploy automatically
5. Get URL: `yourapp-production-xxxx.up.railway.app`

### Option 2: Render
1. Connect GitHub to [Render](https://render.com)
2. Create Web Service
3. Build: `./mvnw clean package -DskipTests`
4. Start: `java -jar target/ip-checker-0.0.1-SNAPSHOT.jar`
5. Add PostgreSQL database

### Option 3: Docker
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app.jar"]
```

```bash
docker build -t ip-checker .
docker run -p 8080:8080 ip-checker
```

## 🛠️ Development

### Running in Development Mode
```bash
# Start backend with hot reload
./mvnw spring-boot:run

# For frontend development, use live server or similar tool
```

### Adding New Features
1. **API Changes**: Update `IPController.java` and `IPService.java`
2. **Database Changes**: Modify `IPLog.java` and `IPRepository.java`
3. **Frontend Changes**: Update `index.html`, `style.css`, `script.js`

### Testing
```bash
# Run all tests
./mvnw test

# Run with coverage
./mvnw test jacoco:report
```

## 🔒 Security Features

- **Input Validation**: Regex-based IP address validation
- **SQL Injection Prevention**: JPA with parameterized queries
- **CORS Configuration**: Configurable cross-origin settings
- **Error Handling**: Comprehensive exception management
- **Transaction Safety**: Atomic database operations

## 📊 Data Management

### Automatic Cleanup System
- **Frequency**: Daily at 2:00 AM
- **Retention Period**: 10 days
- **Safety**: Transaction-based with error handling
- **Logging**: Detailed cleanup logs

### Database Schema
```sql
CREATE TABLE ip_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ip VARCHAR(45) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow Java naming conventions
- Write unit tests for new features
- Update documentation for API changes
- Use meaningful commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **IP-API.com** for providing free IP geolocation service
- **Spring Boot** for the excellent framework
- **H2 Database** for development convenience
- **Community** for feedback and contributions

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/shabeershah05/ip-checker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/shabeershah05/ip-checker/discussions)
- **Email**: shabeershah4777@gmail.com

## 🔄 Changelog

### v1.2.0 (Latest)
- ✅ Added automatic 10-day cleanup system
- ✅ Improved error handling and logging
- ✅ Enhanced frontend design with glassmorphism
- ✅ Added manual cleanup endpoint
- ✅ Transaction-safe database operations

### v1.1.0
- ✅ Added duplicate IP detection
- ✅ Responsive frontend design
- ✅ RESTful API implementation

### v1.0.0
- ✅ Basic IP lookup functionality
- ✅ Spring Boot backend
- ✅ H2 database integration

---

⭐ **Star this repository if you found it helpful!**

**Made with ❤️ by [Syed Shabeer Abbas Shah]**
