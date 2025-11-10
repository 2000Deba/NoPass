import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, { message: "The name must contain at least 2 letters." })
    .max(50, { message: "The name is too big." })
    .regex(/^[\p{L}](?:[\p{L}\s.'-]*[\p{L}])$/u, {
      message: "The name contains invalid starting or ending characters.",
    }),
  email: z.string().email({ message: "Enter valid email." }),
  subject: z
    .string()
    .min(2, { message: "Subject must be at least 2 characters." })
    .max(80, { message: "Subject cannot exceed 80 characters." }),

  message: z
    .string()
    .min(5, { message: "Message must be at least 5 characters." })
    .max(1200, { message: "Message cannot exceed 1200 characters." }),
});
