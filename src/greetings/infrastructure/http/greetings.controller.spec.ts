import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { GenerateGreetingUseCase } from '../../application/generate-greeting.use-case.js';
import { GreetingsController } from './greetings.controller.js';

describe('GreetingsController', () => {
  let controller: GreetingsController;
  const execute = jest.fn();

  beforeEach(async () => {
    execute.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GreetingsController],
      providers: [
        {
          provide: GenerateGreetingUseCase,
          useValue: { execute },
        },
      ],
    }).compile();

    controller = module.get(GreetingsController);
  });

  it('delegates the validated request to the use case', () => {
    execute.mockReturnValue({ message: 'Hola Marco' });

    expect(controller.create({ name: 'Marco' })).toEqual({
      message: 'Hola Marco',
    });
    expect(execute).toHaveBeenCalledWith({ name: 'Marco' });
  });
});
