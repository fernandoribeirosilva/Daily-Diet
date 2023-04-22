import { FastifyReply, FastifyRequest } from 'fastify'

export async function checkSessionExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { sessionId } = request.cookies

  if (!sessionId) {
    return reply.code(401).send({
      error: 'Unauthorized',
    })
  }
}
