/**
 * Zod validation schemas
 */
import { z } from "zod";
import {
  MAX_NAME_LENGTH,
  MAX_CATEGORY_NAME_LENGTH,
  MAX_SIZE_LENGTH,
  MAX_TITLE_LENGTH,
  MAX_LOCATION_LENGTH,
  MAX_NOTES_LENGTH,
} from "./constants";

// Student schemas
export const studentSchema = z.object({
  name: z.string().min(1).max(MAX_NAME_LENGTH).trim(),
  size: z.string().min(1).max(MAX_SIZE_LENGTH).trim(),
  category: z.string().min(1).max(MAX_CATEGORY_NAME_LENGTH).trim(), // Dynamic categories from DB
  eventId: z.number().int().positive(),
});

export const studentUpdateSchema = studentSchema.partial().extend({
  id: z.number().int().positive(),
});

// Attendance schemas
export const attendanceSchema = z.object({
  studentId: z.number().int().positive(),
  eventId: z.number().int().positive(),
  date: z.date().optional(),
});

export const attendanceDeleteSchema = z.object({
  id: z.number().int().positive(),
});

// Payment schemas
export const paymentSchema = z.object({
  studentId: z.number().int().positive(),
  eventId: z.number().int().positive(),
  amount: z.number().nonnegative().multipleOf(0.01),
});

export const paymentUpdateSchema = paymentSchema.partial().extend({
  id: z.number().int().positive(),
});

// Schedule session schemas
export const scheduleSessionSchema = z.object({
  title: z.string().min(1).max(MAX_TITLE_LENGTH).trim(),
  start: z.coerce.date(),
  end: z.coerce.date(),
  location: z.string().max(MAX_LOCATION_LENGTH).trim().optional().nullable(),
  group: z.string().max(MAX_CATEGORY_NAME_LENGTH).trim().optional().nullable(), // Dynamic categories from DB
  notes: z.string().max(MAX_NOTES_LENGTH).trim().optional().nullable(),
  eventId: z.number().int().positive(),
});

export const scheduleSessionUpdateSchema = scheduleSessionSchema
  .partial()
  .extend({
    id: z.number().int().positive(),
  });

// Date range schemas
export const dateRangeSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// Search/filter schemas
export const searchParamsSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(), // Dynamic categories from DB
  size: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
});
