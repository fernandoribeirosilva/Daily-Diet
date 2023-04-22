import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '../utils/prisma'

export async function userRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      email: z.string().email(),
      senha: z.string().min(3),
    })

    const { email, senha } = createUserBodySchema.parse(request.body)

    let sessionId = request.cookies.sessionId
    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      })
    }

    const password = await bcrypt.hash(senha, 10)

    const dadoUser = await prisma.user.create({
      data: {
        email,
        senha: password,
        sessionId,
      },
      select: {
        email: true,
        avatar: true,
        id: true,
      },
    })

    return reply.code(201).send({
      dadoUser,
    })
  })
}
