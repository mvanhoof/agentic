import { defineCollection, z } from 'astro:content';

const machines = defineCollection({
  type: 'content',
  schema: z
    .object({
      name: z.string(),
      manufacturer: z.string(),
      year: z.number(),
      status: z.enum(['current', 'previous']),
      acquiredDate: z.date(),
      soldDate: z.date().nullable().optional(),
      pricePaid: z.number(),
      priceSold: z.number().nullable().optional(),
      ipdbUrl: z.string().url(),
      mods: z.array(z.string()).default([]),
      description: z.string(),
      coverImage: z.string(),
      gallery: z.array(z.string()).default([]),
    })
    .refine((data) => data.status !== 'previous' || data.soldDate != null, {
      message: 'soldDate is required when status is "previous"',
      path: ['soldDate'],
    }),
});

export const collections = { machines };
