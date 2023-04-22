import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { checkSessionExists } from '../middlewares/check-session-id-excistes'
import dayjs from 'dayjs'
import { transformHoursToMinutes } from '../utils/transform-hours-to-minutes'
import { convertMinutesToHourString } from '../utils/convert-minutus-to-hours'

export async function mealRoutes(app: FastifyInstance) {
  app.post(
    '/:userId',
    {
      preHandler: checkSessionExists,
    },
    async (request, reply) => {
      const createNewMeal = z.object({
        nome: z.string(),
        descricao: z.string(),
        dentroDaDieta: z.boolean(),
        data: z.string(),
        hours: z.string(),
      })

      const getUserParamsSchema = z.object({
        userId: z.string().uuid(),
      })

      const { userId } = getUserParamsSchema.parse(request.params)

      const { nome, descricao, dentroDaDieta, data, hours } =
        createNewMeal.parse(request.body)

      const hoursFormatted = transformHoursToMinutes(hours)
      const date = dayjs(data).format('YYYY/MM/DD')

      await prisma.meal.create({
        data: {
          nome,
          descricao: descricao ?? null,
          dentroDaDieta,
          data: date,
          hours: String(hoursFormatted),
          user_id: {
            connect: {
              id: userId,
            },
          },
        },
      })

      return reply.code(201).send()
    },
  )

  app.patch(
    '/atualizar-refeicao/:mealId',
    {
      preHandler: checkSessionExists,
    },
    async (request, reply) => {
      const createNewMeal = z.object({
        nome: z.string().min(2, { message: 'O nome deve ter 2 caracteres!' }),
        descricao: z
          .string()
          .max(80, { message: 'Limite máximo de caracteres atingido!' }),
        dentroDaDieta: z.boolean(),
        data: z.string({
          required_error: 'Data é obrigatória',
          invalid_type_error: 'Name must be a string',
        }),
        hours: z.string({
          required_error: 'Hora é obrigatória',
          invalid_type_error: 'time must be string',
        }),
      })

      const getMealParamsSchema = z.object({
        mealId: z.string().uuid(),
      })

      const { mealId } = getMealParamsSchema.parse(request.params)

      const { nome, descricao, dentroDaDieta, data, hours } =
        createNewMeal.parse(request.body)

      const hoursFormatted = transformHoursToMinutes(hours)
      const newData = dayjs(data).format('YYYY/MM/DD')

      interface Meal {
        nome: string
        descricao: string
        dentroDaDieta: boolean
        date: string
        hours: string
      }

      const meal = {} as Meal

      if (nome) {
        meal.nome = nome
      }

      if (descricao) {
        meal.descricao = descricao
      }

      if (!dentroDaDieta || dentroDaDieta) {
        meal.dentroDaDieta = dentroDaDieta
      }

      const sessionId = request.cookies.sessionId
      const user = await prisma.user.findFirst({
        where: {
          sessionId,
        },
        select: {
          id: true,
        },
      })

      await prisma.meal.update({
        where: {
          id: mealId,
        },
        data: {
          nome: meal.nome,
          descricao: meal.descricao,
          dentroDaDieta: meal.dentroDaDieta,
          data: newData,
          hours: String(hoursFormatted),
          user_id: {
            connect: {
              id: user?.id,
            },
          },
        },
      })

      return reply.code(200).send()
    },
  )

  app.get(
    '/',
    {
      preHandler: checkSessionExists,
    },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId

      const mealdado = await prisma.meal.findMany({
        where: {
          user_id: {
            every: {
              sessionId,
            },
          },
        },
        select: {
          id: true,
          nome: true,
          descricao: true,
          data: true,
          hours: true,
          dentroDaDieta: true,
        },
        orderBy: {
          data: 'asc',
        },
      })

      const totalMeals = await prisma.meal.count({
        where: {
          user_id: {
            every: {
              sessionId,
            },
          },
        },
        select: {
          _all: true,
        },
      })

      const withinTheDiet = await prisma.meal.count({
        where: {
          dentroDaDieta: {
            equals: true,
          },
        },
      })

      const outsideTheDiet = await prisma.meal.count({
        where: {
          dentroDaDieta: {
            equals: false,
          },
        },
      })

      const meal = mealdado.map((item) => {
        const hours = convertMinutesToHourString(Number(item.hours))

        return {
          id: item.id,
          nome: item.nome,
          descricao: item.descricao,
          data: item.data,
          horas: hours,
          dentroDaDieta: item.dentroDaDieta,
        }
      })

      return {
        meal,
        totalMeals,
        withinTheDiet,
        outsideTheDiet,
      }
    },
  )

  app.get(
    '/:mealId',
    {
      preHandler: checkSessionExists,
    },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        mealId: z.string().uuid(),
      })

      const { mealId } = getMealParamsSchema.parse(request.params)

      const meal = await prisma.meal.findFirst({
        where: {
          id: mealId,
        },
        select: {
          id: true,
          nome: true,
          descricao: true,
          data: true,
          dentroDaDieta: true,
        },
      })

      return {
        meal,
      }
    },
  )

  app.delete(
    '/:mealId',
    {
      preHandler: checkSessionExists,
    },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        mealId: z.string().uuid(),
      })

      const { mealId } = getMealParamsSchema.parse(request.params)

      await prisma.meal.delete({
        where: {
          id: mealId,
        },
      })

      return reply.code(200).send()
    },
  )
}
