OGDev-Coconsult: Quality Management System (QMS) Digital Platform
Overview
OGDev-Coconsult is a digital platform designed to manage a Quality Management System (QMS) in compliance with the ISO 9001 standard. It automates, centralizes, and enhances accessibility for managing documents, processes, audits, indicators, and other critical QMS components. The platform ensures continuous improvement and alignment with ISO 9001 clauses.
Key Technologies

Backend: Spring Boot (Java 17) - Provides a robust REST API for resource management.
Frontend: Angular (TypeScript, Angular CLI 19+) - Offers an intuitive and responsive user interface.
Authentication: Keycloak (v26.1.2+) - Manages secure user authentication and role-based access.
Local Development: XAMPP - Hosts the MySQL database and Apache server for local development.
Dependencies: Maven (3.8+) for backend, npm (8+) for frontend.

Objectives

Automation: Streamline the generation of mandatory QMS documents.
Centralization: Provide a single platform for managing processes, audits, and indicators.
Accessibility: Ensure an intuitive interface for various user profiles (management, quality, employees).
Compliance: Align with ISO 9001 clauses and facilitate internal/external audits.

Key Processes and Indicators



Process
Key Indicators



Administrative, Financial, Accounting
Budget compliance, invoice processing times


Customer Operations
Customer satisfaction rate, complaint resolution time


Quality Management
Number of audits, corrected non-conformance rate


Human Resources
Training completion rate, staff turnover (%)


Technical Realization
Project deadline compliance, technical error rate


Design and Development
Prototype validation time, specification compliance rate


Functional Modules



Module
Description and Key Features



Document Management
Storage, organization, lifecycle management (creation, validation, publication, archiving), advanced search.


Process Mapping
Visual modeling of processes, ISO 9001 clause linkage, interaction analysis.


Normative Requirements Management
Tracks ISO clauses, ensures compliance, sends non-compliance notifications.


Audit and Non-Conformance Tracking
Manages audits, tracks non-conformances, provides dashboards and alerts.


Training and Awareness
Manages training sessions, monitors skills, provides ISO standards resources.


Dashboards and Reporting
Tracks KPIs, visualizes trends, generates periodic reports.


Users and Roles
Secure user management, action traceability, role-based access control.


Project Module
Tracks project planning, execution, milestones, and performance reports.


Technical Realization Processes
Manages task tracking, resource allocation, deliverable validation.


Administrative, Financial, Accounting Processes
Automates financial reporting, budget tracking, revenue analysis.


Customer Operations Processes
CRM for contract management, satisfaction tracking, complaint handling.


Quality Management Processes
Real-time non-conformance management, quality performance monitoring.


Human Resources Processes
Centralizes training, skills tracking, employee evaluations.


Enhanced Design and Development Processes
Tracks design steps, manages prototypes, ensures specification compliance.


Project Structure
The project is organized into the following directories:

OGDEVS_AI_Back: Backend code (Spring Boot).
OGDEVSBack_[nomPrenomClasseExamen]: Additional backend resources or configurations.
OGDEVSFront: Frontend code (Angular), located at OGDevsFront/Backoffice/rizz-angular-v1.1.0/rizz-angular-v1.1.0.

Prerequisites
Before starting, ensure the following are installed:

Java 17: For the Spring Boot backend.
Maven 3.8+: For managing backend dependencies.
Node.js 16+ and npm 8+: For the Angular frontend.
Angular CLI 19+: For frontend development.
XAMPP: For hosting the MySQL database and Apache server locally.
Keycloak 26.1.2+: For authentication (can be run via Docker).
Docker: Optional, for running Keycloak.

Installation
1. Clone the Repository
git clone <repository-url>
cd OGDev-Coconsult

2. Set Up the Backend (Spring Boot)

Navigate to the backend directory:cd OGDEVS_AI_Back


Install dependencies:mvn install


Configure the database connection in application.properties to use XAMPP's MySQL (default port: 3306).
Run the application:mvn spring-boot:run

The backend will run on http://localhost:8089.

3. Set Up the Frontend (Angular)

Navigate to the frontend directory:cd OGDevsFront/Backoffice/rizz-angular-v1.1.0/rizz-angular-v1.1.0


Install dependencies:npm install --legacy-peer-deps


Start the development server:ng serve --host 0.0.0.0 --port 4200

The frontend will be accessible at http://localhost:4200

4. Set Up XAMPP

Start XAMPP and enable Apache and MySQL:
Open the XAMPP Control Panel.
Click "Start" for Apache and MySQL.


Verify MySQL is running on localhost:3306 and create a database if needed.

5. Set Up Keycloak

Run Keycloak via Docker:docker run -p 8080:8080 quay.io/keycloak/keycloak:26.1.2 start-dev


Access http://localhost:8080, set up an admin user, and configure a realm.
Update backend and frontend configurations to integrate with Keycloak.

Usage

Ensure XAMPP (Apache and MySQL), Keycloak, backend, and frontend are running.
Access the application at http://localhost:8089.
Log in with Keycloak credentials.
Use the platform to manage QMS processes and generate reports.

Important Notes

Innovation: Teams should prioritize creative and functional enhancements.
Task Distribution: Distribute modules fairly among team members.
Ergonomics and Security: Focus on user-friendly design and robust security (via Keycloak).
Advanced Features: Consider adding decision-support statistics or innovative functionalities.

Contributors

@MohamedBechir21
@Yossrbessaad
@rahmabensaidd
@Alabbr
@mayssakammoun2002
@KhalilMassoudi



License
© 2025 OGDev-Coconsult Team. All rights reserved.
