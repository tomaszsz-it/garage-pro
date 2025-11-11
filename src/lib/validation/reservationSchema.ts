import { z } from "zod";
import { paginationQuerySchema, uuidParamSchema } from "./commonSchemas";

/**
 * Schema for validating GET /reservations query parameters
 * Uses unified pagination schema from commonSchemas
 */
export const getReservationsQuerySchema = paginationQuerySchema;

/**
 * Schema for validating reservation ID path parameter
 * Used in GET /reservations/{id} and PATCH /reservations/{id} endpoints
 * Uses unified UUID schema from commonSchemas
 */
export const getReservationByIdParamsSchema = z.object({
  id: uuidParamSchema,
});

/**
 * Schema for validating reservation update requests
 * Used in PATCH /reservations/{id} endpoint
 */
export const ReservationUpdateSchema = z
  .object({
    service_id: z
      .number({
        invalid_type_error: "service_id must be a number",
      })
      .optional(),
    vehicle_license_plate: z.string().min(1, "vehicle_license_plate cannot be empty").optional(),
    start_ts: z
      .string()
      .datetime({
        message: "start_ts must be a valid ISO8601 datetime string",
      })
      .optional(),
    end_ts: z
      .string()
      .datetime({
        message: "end_ts must be a valid ISO8601 datetime string",
      })
      .optional(),
    status: z
      .enum(["New", "Completed", "Cancelled"], {
        errorMap: () => ({ message: "status must be one of: New, Completed, Cancelled" }),
      })
      .optional(),
  })
  .refine(
    (data) => {
      // If both start_ts and end_ts are provided, validate their relationship
      if (data.start_ts && data.end_ts) {
        const start = new Date(data.start_ts);
        const end = new Date(data.end_ts);
        return start < end;
      }
      return true;
    },
    {
      message: "end_ts must be after start_ts",
      path: ["end_ts"],
    }
  )
  .refine(
    (data) => {
      // At least one field must be provided for update
      return Object.keys(data).length > 0;
    },
    {
      message: "At least one field must be provided for update",
    }
  )
  .refine(
    (data) => {
      // If start_ts is provided, it cannot be in the past
      if (data.start_ts) {
        const start = new Date(data.start_ts);
        const now = new Date();
        return start > now;
      }
      return true;
    },
    {
      message: "start_ts cannot be in the past",
      path: ["start_ts"],
    }
  );

/**
 * Schema for validating reservation creation requests
 * Used in POST /reservations endpoint
 */
export const ReservationCreateSchema = z
  .object({
    service_id: z.number({
      required_error: "service_id is required",
      invalid_type_error: "service_id must be a number",
    }),
    vehicle_license_plate: z
      .string({
        required_error: "vehicle_license_plate is required",
      })
      .min(1, "vehicle_license_plate cannot be empty"),
    employee_id: z
      .string({
        required_error: "employee_id is required",
      })
      .uuid("employee_id must be a valid UUID"),
    start_ts: z
      .string({
        required_error: "start_ts is required",
      })
      .datetime({
        message: "start_ts must be a valid ISO8601 datetime string",
      }),
    end_ts: z
      .string({
        required_error: "end_ts is required",
      })
      .datetime({
        message: "end_ts must be a valid ISO8601 datetime string",
      }),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_ts);
      const end = new Date(data.end_ts);
      return start < end;
    },
    {
      message: "end_ts must be after start_ts",
      path: ["end_ts"],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.start_ts);
      const now = new Date();
      return start > now;
    },
    {
      message: "start_ts cannot be in the past",
      path: ["start_ts"],
    }
  );
