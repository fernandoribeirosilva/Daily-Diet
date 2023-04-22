import { describe, it, beforeEach, beforeAll, afterAll, expect } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'

import { app } from '../app'

describe('User router', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npx prisma migrate reset --force')
    execSync('npx prisma migrate dev')
  })

  it('should be create new user', async () => {
    await request(app.server)
      .post('/user')
      .send({
        email: 'johndonne@gmail.com',
        senha: '123',
        sessionId: '123456',
      })
      .expect(201)
  })

  it('should be contains property to user', async () => {
    const dadoUser = await request(app.server).post('/user').send({
      email: 'johndonne@gmail.com',
      senha: '123',
      sessionId: '123456',
    })

    const userId = await dadoUser.body.dadoUser.id

    expect(dadoUser.body.dadoUser).toEqual(
      expect.objectContaining({
        email: 'johndonne@gmail.com',
        avatar: null,
        id: userId,
      }),
    )
  })
})
