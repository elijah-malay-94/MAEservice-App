## MAEService (Frontend + API + SQL Server + LoRaWAN-ready)

This repo contains:
- **`maeservice-frontend`**: Vite/React UI
- **`MaeServiceApi`**: .NET API (EF Core + MQTT ingestion)

### 🌐 Deploy online (container-friendly)

The project is ready to run as containers. The same setup works locally and on any container host (Azure App Service, Render, Fly.io, VM, etc.).

- **Run locally with Docker**:

```bash
docker compose up --build
```

This starts:
- **Frontend**: `http://localhost:5173`
- **API**: `http://localhost:5052` (OpenAPI at `http://localhost:5052/openapi/v1.json`)
- **SQL Server**: `localhost:1433`

### 🗄️ Connect real SQL Server database

The API uses **SQL Server** when `ConnectionStrings:Default` (or `ConnectionStrings__Default`) is set. If not set, it falls back to an in-memory DB (demo mode).

- **Docker Compose** already sets it for you:
  - `ConnectionStrings__Default=Server=sqlserver,1433;Database=MaeService;User Id=sa;Password=...;TrustServerCertificate=True;Encrypt=False`

- **If you deploy the API online**, set environment variables:
  - **`ConnectionStrings__Default`**: your SQL Server connection string
  - **`Jwt__Key`**, **`Jwt__Issuer`**, **`Jwt__Audience`**

Note: the API currently uses `db.Database.EnsureCreated()` when SQL Server is configured (so it can start without migrations).

### 📡 Connect real LoRaWAN hardware

Your real LoRaWAN devices typically connect to a **Network Server** (NS) like:
- **ChirpStack**
- **The Things Stack (TTS)**

This project connects to real hardware by consuming uplinks from the NS via **MQTT**.

#### Option A: ChirpStack → MQTT (recommended quick path)

- Point the API to your ChirpStack MQTT broker:
  - `Mqtt__Host`
  - `Mqtt__Port`
  - `Mqtt__UseTls` (`true/false`)
  - `Mqtt__Username`
  - `Mqtt__Password`

- Subscribe to typical ChirpStack uplink topic(s):
  - `application/+/device/+/event/up`

In `docker-compose.yml` the API already subscribes to:
- `application/+/device/+/event/up`

#### Option B: The Things Stack (TTS) → MQTT

- Configure the API to connect to the TTS MQTT endpoint (host/port/user/pass depend on your TTS cluster).
- Subscribe to typical TTS v3 uplink topic(s):
  - `v3/+/devices/+/up`

In `docker-compose.yml` the API already subscribes to:
- `v3/+/devices/+/up`

#### What gets stored

When MQTT messages arrive, the API:
- keeps the last ~100 messages in memory for the UI (`GET /api/v2/mqtt/messages`)
- persists a telemetry row to SQL Server (`TelemetryRecord`) including:
  - `DeviceId` (extracted from topic and/or payload)
  - `Value` (best-effort numeric extraction)
  - `Topic` + `PayloadJson` (raw message)

### Frontend configuration (for real deployment)

The frontend reads the API base URL from `VITE_API_BASE_URL`.

- Example file: `maeservice-frontend/env.example`
- For Docker builds, it’s passed as a build arg in `docker-compose.yml`.


