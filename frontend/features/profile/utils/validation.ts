/** WBS-2.x | Owner: S/21/063 | Branch: feature/s21-063-profile-digital-twin | Scope: Profile, Digital Twin, storage and privacy. */
// Validate email
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Validate phone number
export function isValidPhone(phone: string): boolean {
  const regex = /^[0-9+\-\s()]{8,15}$/;
  return regex.test(phone);
}

// Required field
export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}

// Positive number
export function isPositiveNumber(value: string): boolean {
  return !isNaN(Number(value)) && Number(value) > 0;
}

// Height validation (cm)
export function isValidHeight(height: string): boolean {
  const value = Number(height);
  return value >= 50 && value <= 300;
}

// Weight validation (kg)
export function isValidWeight(weight: string): boolean {
  const value = Number(weight);
  return value >= 10 && value <= 500;
}
