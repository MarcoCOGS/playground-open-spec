import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/greetings (POST)', () => {
    return request(app.getHttpServer())
      .post('/greetings')
      .send({ name: 'Marco' })
      .expect('Content-Type', /json/)
      .expect(201)
      .expect({ message: 'Hola Marco' });
  });

  it.each([
    ['a name shorter than 5 characters', { name: 'Mara' }],
    ['a name longer than 20 characters', {
      name: 'abcdefghijklmnopqrstu',
    }],
    ['a name with digits', { name: 'Marco1' }],
    ['a name with symbols', { name: 'Marco#' }],
    ['a missing name', {}],
    ['a non-textual name', { name: 12345 }],
  ])('rejects %s', async (_description, body) => {
    const response = await request(app.getHttpServer())
      .post('/greetings')
      .send(body)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body.statusCode).toBe(400);
    expect(response.body.message.join(' ')).toContain('name');
  });

  afterEach(async () => {
    await app.close();
  });
});
