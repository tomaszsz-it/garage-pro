import { z } from 'zod';

const MAX_DAYS_RANGE = 90;
const DEFAULT_DAYS_RANGE = 30;
const DEFAULT_LIMIT = 32;
const MAX_LIMIT = 200;

export const availableReservationsQuerySchema = z.object({
  service_id: z.coerce
    .number()
    .int()
    .positive('Service ID must be a positive integer'),
  
  start_ts: z.string()
    .datetime('Start time must be a valid ISO8601 datetime')
    .transform((val) => new Date(val))
    .refine((date) => date >= new Date(), 'Start time cannot be in the past')
    .optional(),
  
  end_ts: z.string()
    .datetime('End time must be a valid ISO8601 datetime')
    .transform((val) => new Date(val))
    .optional(),
  
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_LIMIT, `Limit cannot exceed ${MAX_LIMIT}`)
    .optional()
    .default(DEFAULT_LIMIT),
}).refine(
  (data) => {
    if (!data.end_ts) return true;
    if (!data.start_ts) data.start_ts = new Date();
    
    const diffDays = (data.end_ts.getTime() - data.start_ts.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= MAX_DAYS_RANGE;
  },
  {
    message: `End time must be after start time and within ${MAX_DAYS_RANGE} days range`,
    path: ['end_ts'],
  }
);
