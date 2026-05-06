---
goal: Architect and Implement CDN Edge System for Massive Live Streaming
version: 1.1
date_created: 2026-05-05
last_updated: 2026-05-05
owner: AI Assistant
status: 'Planned'
tags: [architecture, infrastructure, feature, ddd, docker, nestjs, testing, performance]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

This plan outlines the architecture and implementation of a highly scalable Content Delivery Network (CDN) and streaming platform designed to handle 50 million simultaneous users, mimicking the 2026 World Cup access patterns. It addresses resilient uploads, asynchronous transcoding, adaptive bitrate delivery, and edge caching using Clean Architecture, DDD, Hexagonal patterns, and Docker multi-stage builds. The stack will use **NestJS**, a real **FFmpeg container**, and **Cassandra**, all tuned for minimum viable resource usage.

## 1. Requirements & Constraints

- **REQ-001**: Implement Resilient Upload via Pre-signed URLs (direct to Object Storage/MinIO).
- **REQ-002**: Implement Asynchronous Processing for Transcoding (generating both HLS and DASH chunks) using a real FFmpeg container.
- **REQ-003**: Implement Content Delivery using ABR (Adaptive Bit Rate) with both DASH and HLS.
- **REQ-004**: Architecture must scale to millions of users (MinIO for heavy files, Cassandra for metadata, Nginx Edge CDN for caching).
- **REQ-005**: Provide minimum 70% test coverage for all applications.
- **REQ-006**: Include a load testing/simulation tool (`k6`) to validate the construction of the application simulating up to 50 million users.
- **CON-001**: Code must follow Clean Code and Clean Architecture (DDD, Hexagonal, Ports & Adapters) built on top of **NestJS**.
- **CON-002**: Infrastructure must use optimized Multi-Stage Dockerfiles (Security hardened, distroless/alpine, non-root, minimal viable resources).
- **CON-003**: Docker Compose must enforce resource limits (`cpus`, `mem_limit`) to ensure the strategy uses the minimum viable resources locally.

## 2. Implementation Steps

### Phase 1: Infrastructure & Project Setup
- GOAL-001: Bootstrap the project structure using NestJS with Clean Architecture and set up optimized Docker infrastructure.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Generate NestJS workspace and set up DDD folder structure (`src/domain`, `src/application`, `src/infrastructure`). | | |
| TASK-002 | Set up `docker-compose.yml` with Nginx (CDN Edge), MinIO (Storage), Cassandra (DB), and RabbitMQ/Redis (Message Broker) with strict resource limits. | | |
| TASK-003 | Create base multi-stage, Alpine-based `Dockerfile` for the NestJS API with minimal viable resources. | | |

### Phase 2: Resilient Upload Service
- GOAL-002: Implement the NestJS backend logic to generate pre-signed URLs for direct S3 uploads.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-004 | Define Video Entity and Value Objects in `domain/video`. | | |
| TASK-005 | Create Use Case `GenerateUploadUrl` in `application/usecases`. | | |
| TASK-006 | Implement S3 Adapter (MinIO) and Cassandra repository in `infrastructure`. | | |
| TASK-007 | Implement NestJS Controller to expose the upload endpoint. | | |
| TASK-008 | Write unit and integration tests with Jest to ensure 70% minimum coverage for the Upload Service. | | |

### Phase 3: Processing & Transcoding Worker
- GOAL-003: Create a real FFmpeg worker service that listens to upload events and transcodes video to HLS and DASH.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-009 | Set up a Docker container with real FFmpeg tailored for minimal resource usage. | | |
| TASK-010 | Implement Transcoding Service to generate both `.m3u8`/`.ts` (HLS) and `.mpd`/`.m4s` (DASH) files. | | |
| TASK-011 | Upload transcoded chunks back to Object Storage and update Cassandra metadata. | | |
| TASK-012 | Write unit and integration tests to ensure 70% minimum coverage for the Worker Service. | | |

### Phase 4: Edge CDN & Delivery
- GOAL-004: Configure Nginx as an Edge CDN to cache video fragments.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-013 | Configure Nginx with `proxy_cache` and memory optimization to cache fragments efficiently. | | |
| TASK-014 | Create a simple HTML5 player page to test ABR streaming (HLS & DASH). | | |

### Phase 5: Validation & Load Testing
- GOAL-005: Validate the system architecture against massive concurrent requests using k6.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-015 | Set up `k6` load testing scripts to simulate high concurrency for upload URLs and CDN fragments. | | |
| TASK-016 | Execute the `k6` simulation, analyze resource consumption, and prove horizontal scalability. | | |

## 3. Alternatives

- **ALT-001**: Using PostgreSQL instead of Cassandra. *Rejected* per user request; Cassandra is explicitly required for the 50M user scale metadata.
- **ALT-002**: Mocking video processing. *Rejected* per user request; a real FFmpeg container will be used to simulate actual processing loads.

## 4. Dependencies

- **DEP-001**: MinIO (for S3 API compatibility)
- **DEP-002**: Cassandra (Metadata Database)
- **DEP-003**: Message broker (RabbitMQ/Redis)
- **DEP-004**: Nginx (Edge Cache Simulator)
- **DEP-005**: FFmpeg (Real container for video transcoding)
- **DEP-006**: NestJS (Backend framework)
- **DEP-007**: k6 (Load testing tool)

## 5. Files

- **FILE-001**: `docker-compose.yml`
- **FILE-002**: `Dockerfile.api` (NestJS)
- **FILE-003**: `Dockerfile.worker` (FFmpeg)
- **FILE-004**: `package.json` (NestJS dependencies & Jest config)
- **FILE-005**: `infrastructure/nginx/nginx.conf`
- **FILE-006**: `tests/load/k6-simulation.js`

## 6. Testing

- **TEST-001**: Jest unit tests for Domain entities and Application use cases (Target: >70%).
- **TEST-002**: Jest integration tests for Infrastructure adapters (Cassandra, MinIO).
- **TEST-003**: `k6` load testing scripts to validate the CDN edge caching and upload URL generation.

## 7. Risks & Assumptions

- **RISK-001**: Running a real FFmpeg container locally can heavily consume CPU. We will apply strict resource limits (`cpus`, `mem_limit`) in `docker-compose.yml` to ensure the strategy uses minimum viable resources locally without crashing your machine.
- **RISK-002**: Simulating 50 million users locally on a single machine is hardware-limited. We will use `k6` to push the local system to its maximum threshold, proving that the stateless architecture and caching layers resolve bottlenecks and can scale horizontally in a real cloud environment.

## 8. Related Specifications / Further Reading

- [NestJS Documentation](https://nestjs.com/)
- [Clean Architecture & DDD](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [k6 Load Testing](https://k6.io/docs/)
