import { AppConfig } from '../../common/config/config.type';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import {
  DeleteMarkerEntry,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  ListObjectVersionsCommand,
  ObjectVersion,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Provider {
  private readonly s3Client: S3Client;
  private readonly s3Bucket = 'c247369';
  // private readonly s3Bucket = 'javadabl-test';

  constructor(private readonly configService: ConfigService<AppConfig>) {
    const accessKeyId = this.configService.get('S3_accessKeyId');
    const secretAccessKey = this.configService.get('S3_secretAccessKey');
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: 'https://c247369.parspack.net',
      // endpoint: 'https://s3.filebase.io',
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
    });
  }

  async Put(s3Key: string, buffer: Buffer, contentType: string) {
    const response = await this.s3Client.send(
      new PutObjectCommand({ Bucket: this.s3Bucket, Key: s3Key, Body: buffer, ContentType: contentType }),
    );
    // Note: response.VersionId contains the ID of the newly created revision
    return response;
  }

  /**
   * Permanently deletes the object and ALL of its revisions/versions.
   */
  async deleteAllVersions(s3Key: string) {
    // 1. List all versions and delete markers for the specific key
    const listCommand = new ListObjectVersionsCommand({ Bucket: this.s3Bucket, Prefix: s3Key });

    const response = await this.s3Client.send(listCommand);

    // Combine actual versions and delete markers into a single array
    const allVersions: (ObjectVersion | DeleteMarkerEntry)[] = [
      ...(response.Versions || []),
      ...(response.DeleteMarkers || []),
    ];

    // Filter to ensure we only target the exact key
    // (Using Prefix can sometimes match other keys that start with the same string)
    const targetVersions = allVersions.filter((v) => v.Key === s3Key);

    if (targetVersions.length === 0) {
      return; // Object doesn't exist or has no versions
    }

    // 2. Delete each version permanently by passing its VersionId
    const deletePromises = targetVersions.map((version) =>
      this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.s3Bucket,
          Key: s3Key,
          VersionId: version.VersionId, // This is the magic parameter for permanent deletion
          BypassGovernanceRetention: true, // Keeps your existing Object Lock bypass
        }),
      ),
    );

    await Promise.all(deletePromises);
  }

  /**
   * (Optional) If you only want to delete a SPECIFIC revision,
   * you can pass the VersionId returned by the Put method.
   */
  async deleteSpecificVersion(s3Key: string, versionId: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.s3Bucket,
      Key: s3Key,
      VersionId: versionId, // Deletes only this specific revision
      BypassGovernanceRetention: true,
    });

    return await this.s3Client.send(command);
  }

  /**
   * Recursively delete every object version and delete marker under a "folder" prefix.
   * This permanently removes all historical revisions, not just the current version.
   */
  async deletePrefixVersions(prefix: string): Promise<{ deleted: number }> {
    // Always terminate with '/' so we don't match sibling prefixes
    // e.g. "parts/5" -> "parts/5/" (avoids matching parts/50, parts/55, ...)
    const normalized = prefix.endsWith('/') ? prefix : `${prefix}/`;

    let keyMarker: string | undefined;
    let versionIdMarker: string | undefined;
    let deletedCount = 0;
    let isTruncated = true;

    do {
      // 1. List ALL versions and delete markers for this prefix
      const listed = await this.s3Client.send(
        new ListObjectVersionsCommand({
          Bucket: this.s3Bucket,
          Prefix: normalized,
          KeyMarker: keyMarker,
          VersionIdMarker: versionIdMarker,
        }),
      );

      const versions = listed.Versions ?? [];
      const deleteMarkers = listed.DeleteMarkers ?? [];
      const allItems = [...versions, ...deleteMarkers];

      if (allItems.length > 0) {
        // 2. DeleteObjectsCommand accepts at most 1000 items per request.
        // ListObjectVersions returns at most 1000 items per page, so batching is safe.
        const result = await this.s3Client.send(
          new DeleteObjectsCommand({
            Bucket: this.s3Bucket,
            BypassGovernanceRetention: true, // Keep your existing Object Lock bypass
            Delete: {
              Objects: allItems
                .filter((item) => item.Key) // TS safety
                .map((item) => ({
                  Key: item.Key as string,
                  VersionId: item.VersionId, // CRITICAL: This triggers permanent deletion
                })),
              Quiet: true,
            },
          }),
        );

        deletedCount += allItems.length;

        // Surface any per-key errors
        if (result.Errors && result.Errors.length > 0) {
          console.error('S3 delete errors:', result.Errors);
        }
      }

      // 3. Update pagination markers for ListObjectVersions (different from ListObjectsV2)
      isTruncated = listed.IsTruncated ?? false;
      keyMarker = listed.NextKeyMarker;
      versionIdMarker = listed.NextVersionIdMarker;
    } while (isTruncated);

    return { deleted: deletedCount };
  }

  async delete(s3Key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.s3Bucket,
      Key: s3Key,
      BypassGovernanceRetention: true,
    });
    const response = await this.s3Client.send(command);
    return response;
  }

  async getSignedUrlByKey(s3Key: string, expiresIn = 3600) {
    const bucketName = this.s3Bucket;
    const command = new GetObjectCommand({ Bucket: bucketName, Key: s3Key });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn });

    return url;
  }

  /** Recursively delete every object under a "folder" prefix. */
  async deletePrefix(prefix: string): Promise<{ deleted: number }> {
    // Always terminate with '/' so we don't match sibling prefixes
    // e.g. "parts/5" -> "parts/5/" (avoids matching parts/50, parts/55, ...)
    const normalized = prefix.endsWith('/') ? prefix : `${prefix}/`;

    let continuationToken: string | undefined;
    let deletedCount = 0;

    do {
      const listed = await this.s3Client.send(
        new ListObjectsV2Command({
          Bucket: this.s3Bucket,
          Prefix: normalized,
          ContinuationToken: continuationToken,
        }),
      );

      const objects = listed.Contents ?? [];
      if (objects.length === 0) {
        continuationToken = listed.IsTruncated ? listed.NextContinuationToken : undefined;
        continue;
      }

      // DeleteObjectsCommand accepts at most 1000 keys per request,
      // and ListObjectsV2 returns at most 1000 keys per page, so we're safe.
      const result = await this.s3Client.send(
        new DeleteObjectsCommand({
          Bucket: this.s3Bucket,
          Delete: {
            Objects: objects
              .filter((o) => o.Key) // TS safety
              .map((o) => ({ Key: o.Key as string })),
            Quiet: true,
          },
        }),
      );

      deletedCount += objects.length;

      // Surface any per-key errors (Filebase occasionally rejects a key)
      if (result.Errors && result.Errors.length > 0) {
        console.error('S3 delete errors:', result.Errors);
      }

      continuationToken = listed.IsTruncated ? listed.NextContinuationToken : undefined;
    } while (continuationToken);

    return { deleted: deletedCount };
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
