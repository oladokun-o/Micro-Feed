import { z } from "zod";

export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(280, "Content must be 280 characters or less")
    .trim(),
});

export const updatePostSchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(280, "Content must be 280 characters or less")
    .trim(),
});

export const postsQuerySchema = z.object({
  query: z.string().optional(),
  cursor: z.string().optional(),
  filter: z.enum(["all", "mine"]).optional().default("all"),
  limit: z.coerce.number().min(1).max(50).optional().default(10),
});

export const createProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be 50 characters or less")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .trim(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type PostsQueryInput = z.infer<typeof postsQuerySchema>;
export type CreateProfileInput = z.infer<typeof createProfileSchema>;
