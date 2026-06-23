# ThuongMaiDienTu (GlowUp)

Nền tảng marketplace dịch vụ gồm frontend web và backend REST API.

## Cấu trúc

- `./`: Frontend (`React + TypeScript + Vite`)
- `./be-e-commerce`: Backend (`Spring Boot + PostgreSQL + JWT`)

## Yêu cầu môi trường

- Node.js 20+, npm 10+
- Java 17+, Maven 3.9+
- PostgreSQL 14+

## Chạy nhanh

Frontend:

```bash
npm install
npm run dev
```

- URL: `http://localhost:5173`
- API base hiện tại: `src/api/config.ts`, `src/services/auth.ts`

Backend:

```bash
cd be-e-commerce
mvn clean package -DskipTests
mvn spring-boot:run
```

- URL: `http://localhost:8080`

## Route frontend chính

- Public: `/`, `/services`, `/provider`, `/find-provider`
- Auth: `/auth/login`, `/auth/register`, `/verify-email`
- Customer: `/customer/*`
- Technician: `/technician/*`
- Admin: `/admin/*`

Chi tiết: `src/router/index.tsx`

## Tài liệu backend

- `be-e-commerce/README.md`
- `be-e-commerce/docs/API_REFERENCE.md`
- `be-e-commerce/docs/WALLET_API.md`
- `be-e-commerce/docs/PAYMENT_INTEGRATION.md`
- `be-e-commerce/docs/COMMISSION_API.md`
