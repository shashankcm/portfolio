import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    stack: z.array(z.string()),
    status: z.enum(['planned', 'in-progress', 'shipped']),
    order: z.number(),
    repo: z.string().url().optional(),
    demo: z.string().url().optional(),
  }),
});

export const collections = { projects };
