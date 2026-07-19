import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const guide = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/guides' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    slug: z.string(),
    published: z.nullish(z.date()),
    updated: z.nullish(z.date()),
    featured: z.boolean(),
    landing: z.boolean(),
    readNext: z.optional(z.array(z.string())),
    mainImage: image(),
  }),
});

export const collections = { guide };
