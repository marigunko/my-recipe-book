import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const sectionSchema = z.object({
  title: z.string().min(1, "Section title is required"),
});

export const recipeSchema = z.object({
  title: z.string().min(1, "Recipe title is required"),
  ingredients: z.string().min(1, "Ingredients are required"),
  instructions: z.string().min(1, "Instructions are required"),
});

export type AuthValues = z.infer<typeof authSchema>;
export type SectionValues = z.infer<typeof sectionSchema>;
export type RecipeValues = z.infer<typeof recipeSchema>;
