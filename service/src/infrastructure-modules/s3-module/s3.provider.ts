import { AppConfig } from '../../common/config/config.type';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Provider {
  private readonly s3Client: S3Client;
  private readonly s3Bucket = 'javadabl-test';

  constructor(private readonly configService: ConfigService<AppConfig>) {
    const accessKeyId = this.configService.get('S3_accessKeyId');
    const secretAccessKey = this.configService.get('S3_secretAccessKey');
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: 'https://s3.filebase.io',
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  async Put(s3Key: string, buffer: Buffer, contentType: string) {
    return await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: s3Key,
        Body: buffer,
        ContentType: contentType,
        // ContentMD5 optional; Filebase supports standard PUT
      }),
    );
  }

  async delete(s3Key: string) {
    const command = new DeleteObjectCommand({ Bucket: this.s3Bucket, Key: s3Key });
    const response = await this.s3Client.send(command);
    return response;
  }
  async getSignedUrlByKey(s3Key: string, expiresIn = 3600) {
    const bucketName = this.s3Bucket;
    const command = new GetObjectCommand({ Bucket: bucketName, Key: s3Key });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn });

    return url;
  }

  /**
   * Returns a short-lived presigned URL for streaming/downloading the media.
   * Replace the old "absolute path" use-case with this.
   */
  /*     async contentGetPresignedUrl(contentId: number, expiresIn = 3600): Promise<string> {
      const content = await this.contentRep.findAndCheckExistsBy(
        {
          where: { id: contentId },
          include: { part: { include: { section: { include: { course: true } } } } },
        },
        'contentId',
        contentId,
      );
  
      const key = content.mediaUrl;
      this.assertKeySafe(key);
  
      // Verify the object actually exists in the bucket
      try {
        await this.s3Client.send(new HeadObjectCommand({ Bucket: this.s3Bucket, Key: key }));
      } catch {
        throw new NotFoundException('Media file not found in object storage');
      }
  
      return getSignedUrl(this.s3Client, new GetObjectCommand({ Bucket: this.s3Bucket, Key: key }), {
        expiresIn,
      });
    }
      
    // Guard against keys that look like paths trying to escape the bucket namespace. 
  private assertKeySafe(key: string): void {
    if (!key || key.startsWith('/') || key.includes('..') || key.includes('\\')) {
      throw new ForbiddenException('Invalid media key.');
    }
    if (!key.startsWith('courses/')) {
      throw new ForbiddenException('Invalid media key.');
    }
  }
    */
}
