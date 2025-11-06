// src/lib/validation/vehicleSchemas.ts
import { z } from "zod";

/**
 * Zod schema for validating vehicle creation data
 * Based on VehicleCreateDto requirements from the implementation plan
 */
export const vehicleCreateSchema = z.object({
  // Required field: license plate (2-20 characters, alphanumeric + spaces)
  license_plate: z
    .string()
    .min(2, "License plate must be at least 2 characters long")
    .max(20, "License plate cannot exceed 20 characters")
    .regex(/^[A-Za-z0-9\s]+$/, "License plate can only contain letters, numbers, and spaces")
    .trim(),

  // Optional field: VIN (exactly 17 characters if provided)
  vin: z
    .string()
    .length(17, "VIN must be exactly 17 characters long")
    .regex(/^[A-HJ-NPR-Z0-9]{17}$/, "VIN contains invalid characters")
    .optional(),

  // Optional field: brand (max 50 characters)
  brand: z.string().max(50, "Brand cannot exceed 50 characters").trim().optional(),

  // Optional field: model (max 50 characters)
  model: z.string().max(50, "Model cannot exceed 50 characters").trim().optional(),

  // Optional field: production year (1980-2080)
  production_year: z
    .number()
    .int("Production year must be an integer")
    .min(1980, "Production year cannot be earlier than 1980")
    .max(2080, "Production year cannot be later than 2080")
    .optional(),

  // Optional field: car type (max 200 characters)
  car_type: z.string().max(200, "Car type cannot exceed 200 characters").trim().optional(),
});

/**
 * Zod schema for validating vehicle update data
 * Based on VehicleUpdateDto requirements from the implementation plan
 * All fields are optional for PATCH operations
 */
export const vehicleUpdateSchema = z.object({
  // Optional field: VIN (exactly 17 characters if provided)
  vin: z
    .string()
    .length(17, "VIN must be exactly 17 characters long")
    .regex(/^[A-HJ-NPR-Z0-9]{17}$/, "VIN contains invalid characters")
    .optional(),

  // Optional field: brand (max 50 characters)
  brand: z.string().max(50, "Brand cannot exceed 50 characters").trim().optional(),

  // Optional field: model (max 50 characters)
  model: z.string().max(50, "Model cannot exceed 50 characters").trim().optional(),

  // Optional field: production year (1900-2030)
  production_year: z
    .number()
    .int("Production year must be an integer")
    .min(1900, "Production year cannot be earlier than 1900")
    .max(2030, "Production year cannot be later than 2030")
    .optional(),

  // Optional field: car type (max 200 characters)
  car_type: z.string().max(200, "Car type cannot exceed 200 characters").trim().optional(),
});

/**
 * Zod schema for validating query parameters for GET /vehicles
 * Includes pagination parameters
 */
export const vehiclesQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1, "Page must be at least 1"),

  limit: z
    .string()
    .optional()
    .default("20")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1 && val <= 100, "Limit must be between 1 and 100"),
});

/**
 * Zod schema for validating path parameters (license_plate)
 * Used in GET/PATCH/DELETE /vehicles/{license_plate}
 */
export const vehiclePathParamsSchema = z.object({
  license_plate: z
    .string()
    .min(2, "License plate must be at least 2 characters long")
    .max(20, "License plate cannot exceed 20 characters")
    .regex(/^[A-Za-z0-9\s]+$/, "License plate can only contain letters, numbers, and spaces")
    .trim(),
});

/**
 * Type inference from the Zod schemas
 */
export type VehicleCreateSchemaType = z.infer<typeof vehicleCreateSchema>;
export type VehicleUpdateSchemaType = z.infer<typeof vehicleUpdateSchema>;
export type VehiclesQuerySchemaType = z.infer<typeof vehiclesQuerySchema>;
export type VehiclePathParamsSchemaType = z.infer<typeof vehiclePathParamsSchema>;
