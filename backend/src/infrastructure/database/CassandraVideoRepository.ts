import { Injectable } from '@nestjs/common';
import { Client } from 'cassandra-driver';
import { IVideoRepository } from '../../application/ports/IVideoRepository';
import { Video } from '../../domain/video/Video';
import { VideoStatus } from '../../domain/video/VideoStatus';

@Injectable()
export class CassandraVideoRepository implements IVideoRepository {
  private client: Client;

  constructor() {
    this.client = new Client({
      contactPoints: [process.env.CASSANDRA_CONTACT_POINT || 'localhost'],
      localDataCenter: process.env.CASSANDRA_DC || 'DC1',
      keyspace: process.env.CASSANDRA_KEYSPACE || 'cdn',
    });
  }

  async save(video: Video): Promise<void> {
    const query = `
      INSERT INTO videos (id, user_id, original_filename, status, created_at, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await this.client.execute(query, [
      video.id,
      video.userId,
      video.originalFilename,
      video.status,
      video.createdAt,
      video.metadata ? JSON.stringify(video.metadata) : null,
    ], { prepare: true });
  }

  async findById(id: string): Promise<Video | null> {
    const query = 'SELECT * FROM videos WHERE id = ?';
    const result = await this.client.execute(query, [id], { prepare: true });
    
    if (result.rowLength === 0) return null;
    
    const row = result.first();
    const video = new Video(
      row.id,
      row.user_id,
      row.original_filename,
      row.status as VideoStatus,
      row.created_at,
      row.metadata ? JSON.parse(row.metadata) : undefined
    );
    return video;
  }
}
