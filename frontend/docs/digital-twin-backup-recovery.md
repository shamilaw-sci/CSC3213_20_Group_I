# Digital Twin Backup and Recovery Runbook

## Owner

S/21/063 — Profile, Digital Twin, Storage and Privacy

## Purpose

This runbook explains how to back up and recover TryVora Digital Twin data without exposing private customer images.

Digital Twin recovery requires three coordinated components:

1. Digital Twin database records
2. Encrypted image files
3. Encryption keys and environment configuration

A database backup without its encrypted files is incomplete. Encrypted files without the correct encryption key cannot be recovered.

## Data included

Back up the following data:

- `digitaltwin` database records
- Related `profile` and `measurement` records
- Encrypted files stored under `PRIVATE_STORAGE_ROOT`
- Encryption-key version information
- Required environment-variable names and deployment configuration

Do not back up generated Prisma client files as application data.

## Sensitive configuration

The application uses:

- `DATA_ENCRYPTION_KEY`
- `PRIVATE_STORAGE_ROOT`
- `DIGITAL_TWIN_URL_SIGNING_SECRET`
- `DELETED_TWIN_RETENTION_DAYS`

Secrets must be stored in an approved secret manager or secure deployment environment.

Never:

- commit secrets to Git;
- include plaintext secrets in documentation;
- store the encryption key inside the same backup archive as the images;
- send secrets through email or public messaging systems.

## Backup procedure

### 1. Prepare a consistent backup window

Schedule the backup during a low-traffic period.

Prevent Digital Twin uploads, replacements and deletions while the database and file-storage snapshots are being created. This prevents the database from referring to a file that is missing from the backup.

Record:

- backup date and time;
- application version or Git commit;
- database version;
- encryption-key version;
- operator responsible for the backup.

### 2. Back up the database

Create a transactionally consistent database backup using the database provider’s supported backup tool.

The backup must include:

- Digital Twin records;
- profile and measurement records;
- user identifiers required by relationships;
- Try-On references to Digital Twins;
- status, deletion and processing timestamps.

Store the database backup in encrypted backup storage.

### 3. Back up encrypted image storage

Back up the complete Digital Twin directory under:

```text
PRIVATE_STORAGE_ROOT/digital-twins
```

If `PRIVATE_STORAGE_ROOT` is not configured, the application uses:

```text
<application-working-directory>/private-storage/digital-twins
```

The files are already encrypted with AES-256-GCM, but the backup destination must also provide encryption at rest and in transit.

### 4. Create an integrity manifest

Create an inventory containing:

- backup identifier and creation time;
- encrypted file count and sizes;
- cryptographic file checksums;
- database-backup checksum;
- application version or Git commit.

Use the manifest to detect corruption or missing files during recovery.

### 5. Protect encryption keys separately

Back up `DATA_ENCRYPTION_KEY` through the approved secret-management or key-recovery process. Keep it separate from the image archive and record its `encryptionKeyVersion`.

The signed-URL secret may be restored or rotated. Rotating it invalidates existing temporary URLs but does not damage encrypted images.

### 6. Verify the backup

Before declaring the backup successful:

- verify database and file checksums;
- compare the database record count with the storage inventory;
- confirm the matching encryption-key version is recoverable;
- record missing or orphaned files;
- record the verification result with the backup identifier.

## Recovery procedure

### 1. Restore into an isolated environment

Perform the first restore in a non-production environment. Do not overwrite production data until the restored copy has been verified.

### 2. Restore environment configuration

Configure these values through the deployment secret manager:

```text
PRIVATE_STORAGE_ROOT
DATA_ENCRYPTION_KEY
DIGITAL_TWIN_URL_SIGNING_SECRET
DELETED_TWIN_RETENTION_DAYS
```

Use the same `DATA_ENCRYPTION_KEY` and key version that encrypted the backup files.

### 3. Restore encrypted files

Restore the files into the expected private-storage directory. The current application stores absolute file paths in Digital Twin records, so either restore to the same absolute location or perform a controlled database path migration.

Restrict filesystem access to the application service account. Never place restored files in a public static-assets directory.

### 4. Restore the database

Restore the database backup from the same backup window as the files. Verify relationships, indexes, status values, deletion timestamps, Try-On references and encryption-key versions.

### 5. Reconcile records and files

Check for:

- database records whose encrypted files are missing;
- encrypted files that have no database record;
- `READY` records with unavailable files;
- expired `DELETED` records awaiting retention cleanup.

Do not automatically publish or delete mismatched data. Record it for controlled investigation.

### 6. Test secure access

Using an authorized test account:

1. Request the current Digital Twin.
2. Confirm the server produces a signed image URL.
3. Confirm the URL returns the correct decrypted image.
4. Confirm expired and modified URLs are rejected.
5. Confirm a different user cannot access the image.
6. Confirm the stored file remains encrypted at rest.

### 7. Return to service

Resume normal operation only after database verification, file checksum verification, sample decryption and access-control testing succeed. Document the recovery time and any data that could not be restored.

## Recovery testing

Run a recovery drill periodically and after major storage, database or encryption changes. Record:

- recovery point and recovery time achieved;
- records and files restored;
- checksum or decryption failures;
- missing or orphaned files;
- corrective actions.

A backup is not reliable until a recovery test succeeds.

## Failure handling

If backup or recovery fails:

- do not expose unverified images;
- keep the application restricted or in maintenance mode;
- preserve logs and integrity reports;
- retry from the last verified backup;
- document the cause and corrective action.

## Privacy requirements

Digital Twin images are sensitive personal data. Backup operators must use least-privilege access, maintain an audit trail, encrypt backups at rest and in transit, apply the approved retention period, securely remove expired backups and never use production customer images for development or demonstrations.
