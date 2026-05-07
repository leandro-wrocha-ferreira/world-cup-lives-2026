# Specification Artifact: MAA-7

## Metadata
- **Ticket ID**: MAA-7
- **Title**: Phase 3: Processing & Transcoding Worker
- **Objective**: Create a real FFmpeg worker service that listens to upload events and transcodes video to HLS and DASH.

## Acceptance Criteria (Tasks)
1. **[TASK-009] FFmpeg Docker**: Set up a Docker container with real FFmpeg tailored for minimal resource usage (alpine based, non-root).
2. **[TASK-010] Transcoding Service**: Implement a Transcoding Service in NestJS to generate both `.m3u8`/`.ts` (HLS) and `.mpd`/`.m4s` (DASH) files. The service should listen to messages from RabbitMQ.

## Architectural Constraints
- **Agent Rules**: Use `debianjail [command]` for installations.
- **Pattern Agent**: Apply DDD/Hexagonal. The Transcoding service should be in `application/services` or `infrastructure/transcoding`.
- **Minimal Resources**: FFmpeg must run efficiently.
