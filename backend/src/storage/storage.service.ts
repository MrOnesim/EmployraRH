import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { Client } from 'minio';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  readonly enabled = !!process.env.MINIO_ENDPOINT;
  private readonly bucket = process.env.MINIO_BUCKET || 'employee-vault';
  private client: Client | null = null;
  private bucketReady = false;

  private getClient(): Client {
    if (!this.enabled) {
      throw new ServiceUnavailableException(
        'Object storage is not configured (MINIO_ENDPOINT missing)',
      );
    }
    if (!this.client) {
      this.client = new Client({
        endPoint: process.env.MINIO_ENDPOINT as string,
        port: process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT, 10) : 9000,
        useSSL: process.env.MINIO_USE_SSL === 'true',
        accessKey: process.env.MINIO_ACCESS_KEY || '',
        secretKey: process.env.MINIO_SECRET_KEY || '',
      });
    }
    return this.client;
  }

  private async ensureBucket(): Promise<void> {
    if (this.bucketReady) return;
    const client = this.getClient();
    const exists = await client.bucketExists(this.bucket).catch(() => false);
    if (!exists) {
      await client.makeBucket(this.bucket, process.env.MINIO_REGION || 'us-east-1');
    }
    this.bucketReady = true;
  }

  async getUploadUrl(objectKey: string, expirySeconds = 3600): Promise<string> {
    await this.ensureBucket();
    return this.getClient().presignedPutObject(this.bucket, objectKey, expirySeconds);
  }

  async getDownloadUrl(objectKey: string, expirySeconds = 3600): Promise<string> {
    await this.ensureBucket();
    return this.getClient().presignedGetObject(this.bucket, objectKey, expirySeconds);
  }

  async remove(objectKey: string): Promise<void> {
    if (!this.enabled) return;
    try {
      await this.getClient().removeObject(this.bucket, objectKey);
    } catch (error) {
      this.logger.error(
        `Failed to remove object "${objectKey}"`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
