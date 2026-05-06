# 🚀 Deployment Diagram — MediShop Pro
## Infrastructure & Hosting Architecture

---

## Deployment 1 — Docker Compose (Local Development)

```mermaid
graph TB
  subgraph "👨‍💻 Developer Machine"
    subgraph "🐳 Docker Compose"
      subgraph "frontend_container [Port 5173]"
        REACT[⚛️ React 19 + Vite Dev Server\nNode.js 20\nHot Module Replacement]
      end

      subgraph "backend_container [Port 3000]"
        NEST[⚙️ NestJS Application\nNode.js 20\nTypeScript Compiled]
        PRISMA_CLI[Prisma Client\nORM Layer]
      end

      subgraph "db_volume [Persistent Volume]"
        SQLITE[(🗄️ SQLite Database\nmedishop.db\nPrisma Migrations)]
      end

      subgraph "uploads_volume [Persistent Volume]"
        UPLOADS[📁 File Storage\nProduct Images\nStore Documents\nRental Contracts]
      end
    end

    BROWSER[🌐 Browser\nlocalhost:5173]
  end

  BROWSER -->|HTTP| REACT
  REACT -->|API Calls\nlocalhost:3000/api| NEST
  NEST --> PRISMA_CLI
  PRISMA_CLI --> SQLITE
  NEST --> UPLOADS
```

---

## Deployment 2 — Production Architecture (Cloud)

```mermaid
graph TB
  subgraph "🌍 Internet"
    USER_PC[👤 Buyer / Seller\nBrowser]
    ADMIN_PC[🛡️ Admin\nBrowser]
  end

  subgraph "☁️ CDN / Edge Layer"
    CDN[🌐 CDN\nCloudflare / Vercel Edge\nStatic Assets Cache]
    DNS[🔤 DNS\nmedishop.dz → IP]
  end

  subgraph "🖥️ Frontend Server — Vercel / Netlify"
    REACT_BUILD[⚛️ React Build\nStatic HTML/CSS/JS\nServer-Side Rendering]
  end

  subgraph "⚙️ Backend Server — VPS / Cloud VM"
    NGINX[🔀 Nginx Reverse Proxy\nSSL Termination\nLoad Balancing\nPort 443 → 3000]

    subgraph "🐳 Docker Container"
      NEST_PROD[NestJS Production\nPM2 Process Manager\nPort 3000]
    end

    subgraph "🗄️ Database"
      SQLITE_PROD[(SQLite / PostgreSQL\nBackup: Daily)]
    end

    subgraph "📁 File Storage"
      UPLOADS_PROD[File Storage\nProduct Images\nDocuments / PDFs]
    end
  end

  subgraph "📧 External Services"
    MAIL[✉️ Email Service\nSMTP / SendGrid]
    PAYMENT[💳 Payment Gateway\nOptional Integration]
  end

  USER_PC --> DNS
  ADMIN_PC --> DNS
  DNS --> CDN
  CDN --> REACT_BUILD
  REACT_BUILD -->|HTTPS API Calls| NGINX
  NGINX --> NEST_PROD
  NEST_PROD --> SQLITE_PROD
  NEST_PROD --> UPLOADS_PROD
  NEST_PROD --> MAIL
  NEST_PROD --> PAYMENT
```

---

## Deployment 3 — Network & Port Configuration

```mermaid
graph LR
  subgraph "External Ports"
    P80[Port 80\nHTTP → redirect 443]
    P443[Port 443\nHTTPS — Public]
  end

  subgraph "Internal Network"
    NGINX_INT[Nginx\n:443 → :3000]
    NEST_INT[NestJS\n:3000]
    VITE_INT[Vite Dev Server\n:5173 — Dev only]
  end

  subgraph "Database"
    SQLITE_FILE[(SQLite File\n/data/medishop.db)]
  end

  P80 -->|301 Redirect| P443
  P443 --> NGINX_INT
  NGINX_INT -->|Proxy| NEST_INT
  NEST_INT --> SQLITE_FILE
  VITE_INT -->|Proxy /api| NEST_INT
```

---

## Deployment 4 — CI/CD Pipeline

```mermaid
flowchart LR
  DEV[👨‍💻 Developer\nLocal Machine] -->|git push| GITHUB[📦 GitHub Repository\nmain branch]
  GITHUB -->|Trigger| CI[🔄 GitHub Actions\nCI Pipeline]
  
  subgraph "CI Steps"
    CI --> INSTALL[npm install]
    INSTALL --> BUILD[npm run build]
    BUILD --> TEST[Run Tests]
    TEST --> LINT[Lint Check]
  end
  
  LINT -->|Pass ✅| DEPLOY[🚀 Deploy]
  LINT -->|Fail ❌| NOTIFY_FAIL[Notify Developer]

  subgraph "Deploy Steps"
    DEPLOY --> DEPLOY_FE[Deploy Frontend\nVercel / Netlify]
    DEPLOY --> DEPLOY_BE[Deploy Backend\nSSH to VPS + Docker pull]
    DEPLOY_BE --> MIGRATE[Run Prisma Migrations]
    MIGRATE --> RESTART[Restart NestJS via PM2]
  end

  DEPLOY_FE & RESTART --> LIVE[🌐 Production Live\nmedishop.dz]
```

---

## Deployment 5 — Data Backup Strategy

```mermaid
graph TB
  subgraph "🗄️ Database Backup"
    DB[(SQLite Production\nmedishop.db)]
    CRON[⏰ Cron Job\nEvery 24 hours]
    BACKUP_LOCAL[📁 Local Backup\n/backups/db/]
    BACKUP_CLOUD[☁️ Cloud Backup\nGoogle Drive / S3]
  end

  subgraph "📁 File Backup"
    UPLOADS[(Uploaded Files\n/uploads/)]
    SYNC[🔄 Rsync\nEvery 6 hours]
    BACKUP_FILES[☁️ Cloud File Storage\nAWS S3 / Cloudinary]
  end

  DB -->|Daily dump| CRON
  CRON --> BACKUP_LOCAL
  CRON --> BACKUP_CLOUD
  UPLOADS --> SYNC
  SYNC --> BACKUP_FILES
```

---

## 📋 Infrastructure Summary

| Component | Technology | Environment | Notes |
|-----------|-----------|-------------|-------|
| **Frontend** | React 19 + Vite | Vercel / Netlify | CDN-cached static build |
| **Backend** | NestJS + Node 20 | VPS (Docker) | PM2 for process management |
| **Database** | SQLite / PostgreSQL | Same VPS | Daily backups to cloud |
| **Reverse Proxy** | Nginx | Same VPS | SSL termination + compression |
| **SSL** | Let's Encrypt | Nginx | Auto-renewed via Certbot |
| **File Storage** | Local FS / S3 | VPS / Cloud | Images, Docs, PDFs |
| **Email** | SMTP / SendGrid | External API | Verification & notifications |
| **CI/CD** | GitHub Actions | GitHub | Auto-deploy on push to main |
| **Monitoring** | PM2 Dashboard | VPS | Process health & logs |
| **Containerization** | Docker + Compose | All envs | Consistent dev/prod setup |
