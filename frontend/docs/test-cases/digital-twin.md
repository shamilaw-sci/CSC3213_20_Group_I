# Digital Twin Test Cases

## Preconditions

- MySQL is running and `npm run dev` is active.
- A customer account is registered and logged in.
- The user has access to **Profile → Digital Twin**.

| ID | Test | Steps | Expected result |
|---|---|---|---|
| DT-01 | Valid image upload | Upload a JPG or PNG below 5 MB. | A twin is created with `READY` status; preview appears after refresh. |
| DT-02 | Invalid file type | Upload a PDF, GIF, or text file. | Upload is rejected with a supported-image message. |
| DT-03 | Oversized file | Upload an image above 5 MB. | Upload is rejected before storage. |
| DT-04 | Excessive dimensions | Upload an image above 24 MP. | Browser rejects it before upload. |
| DT-05 | Preview persistence | Upload an image, refresh Profile. | The authenticated image endpoint restores the saved preview. |
| DT-06 | Encryption at rest | Upload an image; inspect the path in `digitaltwin.encryptedImagePath`. | A `.bin` file exists in private storage; it cannot be viewed as a normal image file. |
| DT-07 | Authenticated access | Copy the twin image API URL, log out, open URL. | Request returns `401` or `404`; the image is not exposed publicly. |
| DT-08 | Ownership isolation | Log in as a second user and request the first user’s twin image URL. | Request returns `404`; the second user cannot read the image. |
| DT-09 | Replace twin | Upload a second valid image. | New twin is `READY`; prior twin is marked `DELETED` and encrypted file is removed. |
| DT-10 | Delete twin | Select remove/delete in Profile. | Twin is marked `DELETED`, encrypted file is removed, and preview disappears. |
| DT-11 | Measurement snapshot | Save measurements, then upload twin. | `measurementsSnapshot` contains the measurement values at upload time. |

## Evidence to capture

- Screenshot of upload validation errors.
- Prisma Studio screenshot of `digitaltwin` before and after deletion.
- Screenshot of the encrypted `.bin` filename only; never include a real customer image in the report.
- API response/status screenshots for DT-07 and DT-08.
