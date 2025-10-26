import { z } from "zod";
import type { ReservationStatus } from "../../types";

/**
 * Schema for validating GET /reservations query parameters
 */
export const getReservationsQuerySchema = z.object({
  page: z.coerce.number().int("page must be an integer").min(1, "page must be greater than 0").default(1),
  limit: z.coerce
    .number()
    .int("limit must be an integer")
    .min(1, "limit must be greater than 0")
    .max(100, "limit cannot exceed 100")
    .default(20),
});

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
      return start > new Date();
    },
    {
      message: "start_ts cannot be in the past",
      path: ["start_ts"],
    }
  );
