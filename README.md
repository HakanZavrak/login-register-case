# AuthApi - Full Stack Auth & Protected Routes

Tamamen Docker ile ayağa kalkabilen, **.NET 8 Web API** (JWT Authentication) + **React Router SPA** yapısında geliştirilmiş bir giriş/kayıt ve korumalı sayfa uygulaması.

##  Hızlı Başlangıç

```bash
# Docker ile tek komutta build + çalıştır
docker compose up -d --build

# Servisleri kontrol et
docker compose ps

# Logları izle
docker compose logs -f
```

---

## Proje Yapısı

```
.
├── backend/
│   └── AuthApi/                # .NET 8 Web API
│       ├── Controllers/
│       ├── Services/
│       ├── Models/
│       ├── Dtos/
│       ├── Data/
│       ├── Infrastructure/     # Monitoring, logging middleware
│       └── Program.cs
├── frontend/                   # React Router 7 SPA
│   ├── src/
│   │   ├── pages/              # Login, Register, Protected
│   │   ├── components/         # Navbar, Footer, UI parçaları
│   │   └── Utilities/          # auth token helper, axios instance
│   └── tests/e2e/              # Playwright testleri
├── docker-compose.yml
└── README.md
```

---

## Servis URL'leri

| Servis    | Port  | Açıklama                     |
|-----------|-------|------------------------------|
| Frontend  | 8085  | React SPA                    |
| Backend   | 8080  | .NET 8 Web API + Swagger UI  |
| Database  | 5432  | PostgreSQL 16                |

---

## Geliştirme Modu

### Backend (API)
```bash
cd backend/AuthApi
dotnet run
```
Varsayılan adres: http://localhost:8080  
Swagger UI: http://localhost:8080/swagger

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Varsayılan adres: http://localhost:5173

---

## Önemli Özellikler

- **JWT Authentication** (login/register akışı)
- **Korumalı endpoint**: `/me`
- **React Router PrivateRoute** koruması
- **CORS** ayarlı
- **DB Migration**: Startup'ta otomatik
- **Health Check**: `/healthz`
- **Minimal Monitoring**:(TODO)
  - Her istek loglanır → `GET /me -> 200 15ms`
- **Logout** → localStorage token silme

---

## Testler

### Backend Unit/Integration
```bash
cd backend/AuthApi.Tests
dotnet test
```

### E2E (Playwright)
```bash
cd frontend
npx playwright test
```
- **Senaryolar**:
  - `register → login → protected` başarılı geçiş
  - `token yokken → /protected → /login` yönlendirme
- Testler docker-compose ortamında da çalışır.

---

## Docker Ortamı

**docker-compose.yml** servisleri:
- **db**: Postgres 16
- **api**: .NET API
- **web**: React build + Nginx (API proxy ile)

### Çalıştırma
```bash
docker compose up -d --build
```

### Durdurma
```bash
docker compose down
```


---

## İzleme & Sağlık
- **/healthz** → 200 OK döner