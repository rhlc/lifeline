import type { FastifyReply } from 'fastify';
import type { ZodSchema } from 'zod';

/** Parse `data` with `schema`; on failure send 400 and return undefined. */
export function parseOr400<T>(schema: ZodSchema<T>, data: unknown, reply: FastifyReply): T | undefined {
  const result = schema.safeParse(data);
  if (!result.success) {
    reply.code(400).send({ error: 'invalid input', details: result.error.flatten() });
    return undefined;
  }
  return result.data;
}
