export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Ecommerce Site";
export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Ecommerce Site";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const LATEST_PRODUCTS_LIMIT =
  Number(process.env.LATEST_PRODUCTS_LIMIT) || 4;

// Default values for sign-in form (for development/testing)
export const signInDefaultValues = {
  email: "admin@example.com",
  password: "123456",
};

export const signUpDefaultValues = {
  name: "Steve Smith",
  email: "steve@example.com",
  password: "password",
  confirmPassword: "password",
};

export const shippingAddressDefaultValues = {
  fullName: "John Doe",
  streetAddress: "123 Main St",
  city: "Anytown",
  postalCode: "12345",
  country: "USA",
};
