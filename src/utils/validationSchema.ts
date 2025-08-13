import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().trim().min(3),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().trim().min(6),
    confirmPassword: z.string().trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().trim().min(6),
});

export const saveRecipeSchema = z.object({
  title: z.string().trim().min(3),
  ingredients: z.string().trim().min(3),
  steps: z.string().trim().min(3),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(3).optional(),
  password: z.string().trim().min(6).optional(),
  confirmPassword: z.string().trim().min(6).optional(),
});
