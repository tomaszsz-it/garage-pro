// src/lib/validation/commonSchemas.ts
import { z } from "zod";

/**
 * Unified pagination query schema used across all endpoints
 * Ensures consistent pagination parameters throughout the application
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * License plate parameter schema for URL path parameters
 * Used in vehicle endpoints: GET/PATCH/DELETE /vehicles/{license_plate}
 */
export const licensePlateParamSchema = z
  .string()
  .min(2)
  .max(20)
  .regex(/^[A-Za-z0-9\s]+$/)
  .transform((val) => decodeURIComponent(val).trim());

/**
 * UUID parameter schema for URL path parameters
 * Used in reservation endpoints: GET/PATCH /reservations/{id}
 */
export const uuidParamSchema = z.string().uuid();

/**
 * Type inference from the common schemas
 */
export type PaginationQuerySchemaType = z.infer<typeof paginationQuerySchema>;
export type LicensePlateParamSchemaType = z.infer<typeof licensePlateParamSchema>;
export type UuidParamSchemaType = z.infer<typeof uuidParamSchema>;
