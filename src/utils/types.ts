import { registerSchema, loginSchema } from "./validationSchema";
import * as z from "zod";

export type JWTPayload = {
  id: string;
  email: string;
};
export type RegisterForm = z.infer<typeof registerSchema>;
export type LoginForm = z.infer<typeof loginSchema>;
