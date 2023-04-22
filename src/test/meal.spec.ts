import { describe, it, beforeEach, beforeAll, afterAll } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'

import { app } from '../app'

describe('Meal router', () => {
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

  it('should be create new meal', async () => {
    const user = await request(app.server).post('/user').send({
      email: 'johndonne@gmail.com',
      senha: '123',
      sessionId: '123456',
    })

    const cookies = user.get('Set-Cookie')

    const userId = await user.body.dadoUser.id

    await request(app.server)
      .post(`/meal/${userId}`)
      .set('Cookie', cookies)
      .send({
        nome: 'Batata doce',
        descricao: 'Batata doce',
        dentroDaDieta: true,
        data: '2023-4-18',
        hours: '2:30',
      })
      .expect(201)
  })

  it('should be list all a meal', async () => {
    const user = await request(app.server).post('/user').send({
      email: 'johndonne@gmail.com',
      senha: '123',
      sessionId: '123456',
    })

    const cookies = user.get('Set-Cookie')
    const userId = await user.body.dadoUser.id

    await request(app.server)
      .post(`/meal/${userId}`)
      .set('Cookie', cookies)
      .send({
        nome: 'Batata doce',
        descricao: 'Batata doce',
        dentroDaDieta: true,
        data: '2023-4-18',
        hours: '2:30',
      })

    await request(app.server)
      .post(`/meal/${userId}`)
      .set('Cookie', cookies)
      .send({
        nome: 'cenoura',
        descricao: '',
        dentroDaDieta: true,
        data: '2023-4-01',
        hours: '9:30',
      })

    await request(app.server)
      .post(`/meal/${userId}`)
      .set('Cookie', cookies)
      .send({
        nome: 'ovo',
        descricao: '',
        dentroDaDieta: true,
        data: '2023-4-01',
        hours: '4:00',
      })
    await request(app.server)
      .post(`/meal/${userId}`)
      .set('Cookie', cookies)
      .send({
        nome: 'salada',
        descricao: '',
        dentroDaDieta: true,
        data: '2023-4-02',
        hours: '14:00',
      })

    await request(app.server)
      .post(`/meal/${userId}`)
      .set('Cookie', cookies)
      .send({
        nome: 'Batata frita',
        descricao: 'Batata frita',
        dentroDaDieta: false,
        data: '2023-4-30',
        hours: '13:50',
      })

    const meal = await request(app.server)
      .get('/meal')
      .set('Cookie', cookies)
      .expect(200)

    console.log(meal.body)
  })

  it('should be update a meal', async () => {
    const user = await request(app.server).post('/user').send({
      email: 'johndonne@gmail.com',
      senha: '123',
      sessionId: '123456',
    })

    const cookies = user.get('Set-Cookie')
    const userId = await user.body.dadoUser.id

    await request(app.server)
      .post(`/meal/${userId}`)
      .set('Cookie', cookies)
      .send({
        nome: 'Batata doce',
        descricao: 'Batata doce',
        dentroDaDieta: false,
        data: '2023-4-18',
        hours: '2:30',
      })

    const meal = await request(app.server)
      .get('/meal')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = await meal.body.meal[0].id

    await request(app.server)
      .patch(`/meal/atualizar-refeicao/${mealId}`)
      .set('Cookie', cookies)
      .send({
        nome: 'Batata frita',
        descricao: 'Batata frita',
        dentroDaDieta: false,
        data: '2023-4-18',
        hours: '2:50',
      })
      .expect(200)
  })

  // it('should be delete a meal', async () => {
  //   const user = await request(app.server).post('/user').send({
  //     email: 'johndonne@gmail.com',
  //     senha: '123',
  //     sessionId: '123456',
  //   })

  //   const cookies = user.get('Set-Cookie')
  //   const userId = await user.body.dadoUser.id

  //   await request(app.server)
  //     .post(`/meal/${userId}`)
  //     .set('Cookie', cookies)
  //     .send({
  //       nome: 'Batata doce',
  //       descricao: 'Batata doce',
  //       dentroDaDieta: false,
  //       data: '2023-4-18',
  //       hours: '2:30',
  //     })

  //   const meal = await request(app.server)
  //     .get('/meal')
  //     .set('Cookie', cookies)
  //     .expect(200)

  //   const mealId = await meal.body.meal[0].id

  //   await request(app.server)
  //     .delete(`/meal/${mealId}`)
  //     .set('Cookie', cookies)
  //     .expect(200)
  // })
})
