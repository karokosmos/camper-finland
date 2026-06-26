import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const article = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    slug: z.string(),
    published: z.nullish(z.date()),
    updated: z.nullish(z.date()),
    featured: z.boolean(),
    landing: z.boolean()
  }),
});

export const collections = { article };
