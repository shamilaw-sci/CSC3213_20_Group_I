# TryVora Digital Twin Privacy, Retention, and Deletion Policy

## Purpose and data collected

TryVora processes a customer-provided full-body image and optional body measurements only to provide digital-twin and virtual fitting features. The application stores the encrypted image path, upload-time measurement snapshot, status, and timestamps.

## Storage and access control

- Digital-twin image bytes are encrypted using AES-256-GCM before being written to private storage.
- Images are not stored in the public static-assets folder.
- The browser receives an image only through an authenticated, ownership-checked endpoint.
- Database sessions, RBAC checks, and user ownership prevent another customer from retrieving a twin.
- `DATA_ENCRYPTION_KEY` must be kept only in the deployment environment; never commit it to Git.

## Retention

- The current twin is retained while the customer account remains active.
- Replacing a twin marks the previous database record as `DELETED` and removes its encrypted image file.
- Deleting a twin removes the encrypted file immediately and retains only the deleted database record for audit/operational purposes.
- Configure `DELETED_TWIN_RETENTION_DAYS` for the operational retention period. A scheduled cleanup task should permanently purge expired deleted records in production.

## Customer controls

- Customers can upload or replace their twin from Profile → Digital Twin.
- Customers can delete the current twin from the same page.
- Deleting an account revokes sessions and marks the account deleted. Production operations must run the scheduled purge after the retention window.

## Security operations

- Restrict private-storage filesystem access to the application service account.
- Back up encrypted files and database records separately; protect backup keys to the same standard as production keys.
- Rotate `DATA_ENCRYPTION_KEY` through a controlled migration process and increment `encryptionKeyVersion` for re-encrypted files.
- Log and investigate failed decryption, repeated upload failures, and unauthorized image requests.

## Production requirements

- Serve the application over HTTPS.
- Use managed encrypted object storage or an encrypted private volume.
- Establish a Data Processing Agreement and lawful basis/consent text before collecting real customer body images.
- Provide a privacy-contact route for export and deletion requests where required by applicable law.
