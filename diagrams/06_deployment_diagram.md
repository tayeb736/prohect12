# 🚀 Deployment Diagram — MediShop Pro
## Infrastructure & Hosting Architecture (PostgreSQL + Redis + S3 + Stripe)

---

## Deployment 1 — Docker Compose (Local Development)

```mermaid
graph TB
  subgraph "👨‍💻 Developer Machine"
    subgraph "🐳 Docker Compose Network"
      subgraph "frontend [Port 5173]"
        REACT[⚛️ React 19 + Vite Dev Server\nNode.js 20\nHot Module Replacement]
      end

      subgraph "backend [Port 3000]"
        NEST[⚙️ NestJS Application\nNode.js 20 / TypeScript\nSwagger UI at /api/docs]
        PRISMA_CLI[Prisma 7 ORM\nMigrations & Client]
      end

      subgraph "postgres [Port 5432]"
        PG[(🐘 PostgreSQL 15\nmedishop_db\nPrisma Migrations)]
      end

      subgraph "redis [Port 6379]"
        REDIS[(⚡ Redis 7\nCart Cache\nSession Store\nRate Limit Counter)]
      end

      subgraph "volumes"
        UPLOADS[📁 Local File Storage\nProduct Images\nKYC Documents\nRental Contracts PDF]
      end
    end

    BROWSER[🌐 Browser\nlocalhost:5173]
    SWAGGER_UI[📄 Swagger UI\nlocalhost:3000/api/docs]
  end

  BROWSER -->|HTTP| REACT
  REACT -->|API Calls → localhost:3000/api| NEST
  SWAGGER_UI -->|Test APIs| NEST
  NEST --> PRISMA_CLI
  PRISMA_CLI --> PG
  NEST --> REDIS
  NEST --> UPLOADS
```

---

## Deployment 2 — Production Architecture (Cloud — AWS / DigitalOcean)

```mermaid
graph TB
  subgraph "🌍 Internet"
    USER_PC[👤 Buyers & Sellers\nBrowser / Mobile]
    ADMIN_PC[🛡️ Admin\nBrowser]
  end

  subgraph "☁️ CDN / Edge Layer"
    CDN[🌐 Cloudflare CDN\nStatic Assets Cache\nDDoS Protection]
    DNS[🔤 DNS\nmedishop.dz → Elastic IP]
  end

  subgraph "🖥️ Frontend — Vercel / Netlify"
    REACT_BUILD[⚛️ React 19 Build\nStatic HTML / CSS / JS\nVite Production Bundle]
  end

  subgraph "⚙️ Backend Server — AWS EC2 / DigitalOcean VPS"
    NGINX[🔀 Nginx Reverse Proxy\nSSL Termination — Let's Encrypt\nGzip Compression\nPort 443 → 3000]

    subgraph "🐳 Docker Container — backend"
      NEST_PROD[NestJS Production\nPM2 Process Manager\nPort 3000\nSwagger at /api/docs]
    end

    subgraph "🐳 Docker Container — postgres"
      PG_PROD[(🐘 PostgreSQL 15\nProduction Database\nDaily Automated Backups)]
    end

    subgraph "🐳 Docker Container — redis"
      REDIS_PROD[(⚡ Redis 7\nCart Persistence\nSession Store\nRate Limiting)]
    end
  end

  subgraph "☁️ AWS External Services"
    S3[🗂️ AWS S3 / Cloudinary\nProduct Images\nKYC Legal Documents\nTax Invoices PDF\nRental Contracts]
    RDS[🗄️ AWS RDS — Optional\nManaged PostgreSQL\nAuto-scaling & Failover]
  end

  subgraph "💳 Payment & Communication"
    STRIPE[💳 Stripe API\nSplit Payments\nDeposit Management\nRefunds]
    MAIL[✉️ SMTP / SendGrid\nVerification Emails\nOrder Notifications\nDispute Alerts]
  end

  USER_PC --> DNS
  ADMIN_PC --> DNS
  DNS --> CDN
  CDN --> REACT_BUILD
  REACT_BUILD -->|HTTPS REST API| NGINX
  NGINX --> NEST_PROD
  NEST_PROD --> PG_PROD
  NEST_PROD --> REDIS_PROD
  NEST_PROD --> S3
  NEST_PROD --> STRIPE
  NEST_PROD --> MAIL
  PG_PROD -.->|Optional Migration| RDS
```

---

## Deployment 3 — Network Ports & Services Map

```mermaid
graph LR
  subgraph "Public Ports"
    P80[Port 80 — HTTP\nRedirect to 443]
    P443[Port 443 — HTTPS\nPublic Endpoint]
  end

  subgraph "Internal Docker Network"
    NGINX_SVC[Nginx\n:443 → :3000]
    NEST_SVC[NestJS\n:3000]
    PG_SVC[PostgreSQL\n:5432]
    REDIS_SVC[Redis\n:6379]
    VITE_SVC[Vite Dev Server\n:5173 — Dev Only]
  end

  subgraph "External APIs"
    STRIPE_API[Stripe API\nhttps://api.stripe.com]
    S3_API[AWS S3\nhttps://s3.amazonaws.com]
    MAIL_API[SendGrid\nhttps://api.sendgrid.com]
  end

  P80 -->|301 Redirect| P443
  P443 --> NGINX_SVC
  NGINX_SVC -->|Reverse Proxy| NEST_SVC
  NEST_SVC --> PG_SVC
  NEST_SVC --> REDIS_SVC
  VITE_SVC -->|/api proxy| NEST_SVC
  NEST_SVC --> STRIPE_API
  NEST_SVC --> S3_API
  NEST_SVC --> MAIL_API
```

---

## Deployment 4 — CI/CD Pipeline

```mermaid
flowchart LR
  DEV[👨‍💻 Developer] -->|git push main| GITHUB[📦 GitHub Repository]
  GITHUB -->|Webhook Trigger| CI[🔄 GitHub Actions CI]

  subgraph "CI Steps"
    CI --> INSTALL[npm ci — Install deps]
    INSTALL --> LINT[ESLint + TypeScript Check]
    LINT --> BUILD[npm run build]
    BUILD --> TEST[Unit & Integration Tests]
    TEST --> AUDIT[npm audit — Security Check]
  end

  AUDIT -->|✅ Pass| DEPLOY[🚀 Deploy Stage]
  AUDIT -->|❌ Fail| NOTIFY[📧 Notify Developer]

  subgraph "Deploy Steps"
    DEPLOY --> DEPLOY_FE[Deploy Frontend\nVercel / Netlify Auto Deploy]
    DEPLOY --> SSH[SSH to VPS]
    SSH --> PULL[docker-compose pull]
    PULL --> MIGRATE[prisma migrate deploy\nPostgreSQL Migrations]
    MIGRATE --> RESTART[docker-compose up -d\nPM2 Reload]
  end

  DEPLOY_FE & RESTART --> LIVE[🌐 Live — medishop.dz]
```

---

## Deployment 5 — Security Architecture

```mermaid
graph TB
  subgraph "🛡️ Security Layers"
    CDN_SEC[Cloudflare\nDDoS Protection\nBot Filtering\nEdge Firewall]
    NGINX_SEC[Nginx\nSSL/TLS 1.3\nHTTP Security Headers\nCSP / HSTS / X-Frame]
    RATE[Rate Limiter — Redis\nMax 5 login attempts\n15min lockout]
    JWT_SEC[JWT — HttpOnly Cookies\nNo XSS Token Theft\nBcrypt password hashing]
    VALID[class-validator\nSQL Injection Prevention\nXSS Input Sanitization]
    RBAC[Role-Based Guards\nBUYER / SELLER / SUPER_ADMIN\nRoute-level Protection]
  end

  USER[👤 User Request] --> CDN_SEC
  CDN_SEC --> NGINX_SEC
  NGINX_SEC --> RATE
  RATE --> JWT_SEC
  JWT_SEC --> VALID
  VALID --> RBAC
  RBAC --> API_HANDLER[✅ API Handler]
```

---

## Deployment 6 — Backup & Recovery Strategy

```mermaid
graph TB
  subgraph "🗄️ Database Backup — PostgreSQL"
    PG_DB[(PostgreSQL Production)]
    CRON_DB[pg_dump Cron Job\nEvery 24 hours]
    BACKUP_LOCAL[Local Backup\n/backups/db/]
    BACKUP_S3[AWS S3 Bucket\nEncrypted Backups\n30-day Retention]
  end

  subgraph "📁 File Backup — S3"
    S3_FILES[(AWS S3 Primary\nProduct Images / Docs)]
    S3_REPLICA[AWS S3 Cross-Region\nReplica — Auto Sync]
  end

  subgraph "⚡ Redis Backup"
    REDIS_DB[(Redis Cache)]
    REDIS_PERSIST[Redis AOF Persistence\nPoint-in-time Recovery]
  end

  PG_DB --> CRON_DB
  CRON_DB --> BACKUP_LOCAL
  CRON_DB --> BACKUP_S3
  S3_FILES --> S3_REPLICA
  REDIS_DB --> REDIS_PERSIST
```

---

## 📋 Infrastructure Summary (Per readme2 & README3)

| Component | Technology | Hosting | Notes |
|-----------|-----------|---------|-------|
| **Frontend** | React 19 + Vite | Vercel / Netlify | CDN-cached static build |
| **Backend** | NestJS + Node 20 | AWS EC2 / DigitalOcean | PM2 + Docker |
| **Database** | PostgreSQL 15 | Docker / AWS RDS | Auto daily backups |
| **Cache** | Redis 7 | Docker Container | Cart, Sessions, Rate Limit |
| **File Storage** | AWS S3 / Cloudinary | AWS | Images, KYC Docs, PDFs |
| **Payment** | Stripe | External API | Split payments + Deposits |
| **Reverse Proxy** | Nginx | VPS | SSL + Compression |
| **SSL** | Let's Encrypt | Nginx / Cloudflare | Auto-renewed |
| **CDN / Security** | Cloudflare | Edge | DDoS + Bot protection |
| **Email** | SMTP / SendGrid | External API | Transactional emails |
| **CI/CD** | GitHub Actions | GitHub | Auto-deploy on push |
| **API Docs** | Swagger / OpenAPI | /api/docs | Dev & testing |
| **Monitoring** | PM2 Dashboard | VPS | Process health & logs |
