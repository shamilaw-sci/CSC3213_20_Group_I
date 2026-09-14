export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB


export const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
];



export function validateImage(
  file: File
): {
  valid: boolean;
  error?: string;
} {

  // Check file type

  if (
    !ALLOWED_IMAGE_TYPES.includes(file.type)
  ) {

    return {
      valid: false,
      error:
        "Only PNG and JPG images are supported",
    };

  }



  // Check file size

  if (
    file.size > MAX_IMAGE_SIZE
  ) {

    return {
      valid: false,
      error:
        "Image size must be less than 5MB",
    };

  }



  return {
    valid: true,
  };

}
