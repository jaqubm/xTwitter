# Dokumentacja Docker Compose

## Opis

Ten plik `docker-compose.yml` definiuje konfigurację dla aplikacji `xTwitter`, składającej się z trzech usług: `mongodb`, `backend` i `frontend`. Każda z usług jest uruchamiana jako osobny kontener Docker, zdefiniowany w poniższej konfiguracji.

## Usługi

### 1. MongoDB

- **Nazwa kontenera**: `xTwitter_db`
- **Obraz**: `mongo`
- **Porty**:
  - `27017:27017`
- **Volumeny**:
  - `data:/data/db`
- **Sieci**:
  - `express-mongo`
- **Restart**: zawsze

MongoDB jest bazą danych NoSQL używaną do przechowywania danych aplikacji.

### 2. Backend

- **Nazwa kontenera**: `xTwitter_backend`
- **Kontekst budowania**: `./backend`
- **Dockerfile**: `Dockerfile`
- **Porty**:
  - `8000:8000`
- **Volumeny**:
  - `./backend:/app`
  - `/app/node_modules`
- **Zależności**:
  - `mongodb`
- **Sieci**:
  - `express-mongo`
  - `react-express`
- **Restart**: zawsze

Backend jest serwerem Node.js zbudowanym na podstawie Dockerfile znajdującego się w katalogu `./backend`. Kontener backendu komunikuje się z bazą danych MongoDB oraz frontendem.

### 3. Frontend

- **Nazwa kontenera**: `xTwitter_frontend`
- **Kontekst budowania**: `./frontend`
- **Dockerfile**: `Dockerfile`
- **Porty**:
  - `5173:5173`
- **Zależności**:
  - `backend`
- **Sieci**:
  - `react-express`
- **Restart**: zawsze
- **stdin_open**: true

Frontend jest aplikacją React zbudowaną na podstawie Dockerfile znajdującego się w katalogu `./frontend`. Kontener frontend komunikuje się z backendem.

## Sieci

### 1. react-express

Ta sieć umożliwia komunikację między frontendem a backendem.

### 2. express-mongo

Ta sieć umożliwia komunikację między backendem a MongoDB.

## Volumeny

### 1. data

Volumen używany do przechowywania danych MongoDB na hoście, aby zapewnić trwałość danych.

## Uruchomienie

Aby uruchomić aplikację `xTwitter`, użyj poniższego polecenia:

```bash
docker-compose up --build
