import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { IMetadataPort } from '../../application/ports/metadata.port';
import { Client } from 'cassandra-driver';

@Injectable()
export class CassandraAdapter implements IMetadataPort, OnModuleInit, OnModuleDestroy {
  private client: Client;

  constructor() {
    this.client = new Client({
      contactPoints: [process.env.CASSANDRA_CONTACT_POINTS || 'localhost'],
      localDataCenter: process.env.CASSANDRA_LOCAL_DATACENTER || 'datacenter1',
      keyspace: process.env.CASSANDRA_KEYSPACE || 'cdn_metadata',
    });
  }

  async onModuleInit() {
    await this.client.connect().catch(e => console.warn('Cassandra connect failed (expected if not running): ', e.message));
  }

  async onModuleDestroy() {
    await this.client.shutdown();
  }

  async updateVideoStatus(videoId: string, status: string, urls: { hls?: string; dash?: string }): Promise<void> {
    const query = `UPDATE videos SET status = ?, hls_url = ?, dash_url = ? WHERE id = ?`;
    await this.client.execute(query, [status, urls.hls || null, urls.dash || null, videoId], { prepare: true }).catch(e => console.warn('Cassandra execute failed:', e.message));
  }
}
