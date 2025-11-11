import { z } from "zod";
import { paginationQuerySchema } from "./commonSchemas";

const MAX_DAYS_RANGE = 90;

export const availableReservationsQuerySchema = z
  .object({
    service_id: z.coerce.number().int().positive("Service ID must be a positive integer"),

    start_ts: z
      .string()
      .optional()
      .refine((dateStr) => {
        if (!dateStr) return true;
        const date = new Date(dateStr);
        return !isNaN(date.getTime());
      }, "Start time must be a valid datetime")
      .refine((dateStr) => {
        if (!dateStr) return true;
        const date = new Date(dateStr);
        const now = new Date();
        // Allow queries that start from yesterday to accommodate week views
        // This is for querying available slots, not for actual reservations
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        return date >= yesterday;
      }, "Start time cannot be more than 1 day in the past"),

    end_ts: z
      .string()
      .optional()
      .refine((dateStr) => {
        if (!dateStr) return true;
        const date = new Date(dateStr);
        return !isNaN(date.getTime());
      }, "End time must be a valid datetime"),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(300, "Limit cannot exceed 300")
      .optional()
      .default(20),
  })
  .refine(
    (data) => {
      if (!data.end_ts) return true;

      const startDate = data.start_ts ? new Date(data.start_ts) : new Date();
      const endDate = new Date(data.end_ts);

      const diffDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays > 0 && diffDays <= MAX_DAYS_RANGE;
    },
    {
      message: `End time must be after start time and within ${MAX_DAYS_RANGE} days range`,
      path: ["end_ts"],
    }
  );
