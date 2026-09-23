import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { GenerateFullNameGreetingUseCase } from '../../application/generate-full-name-greeting.use-case.js';
import { GenerateGreetingUseCase } from '../../application/generate-greeting.use-case.js';
import { GreetingsController } from './greetings.controller.js';

describe('GreetingsController', () => {
  let controller: GreetingsController;
  const execute = jest.fn();
  const executeFullName = jest.fn();

  beforeEach(async () => {
    execute.mockReset();
    executeFullName.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GreetingsController],
      providers: [
        {
          provide: GenerateGreetingUseCase,
          useValue: { execute },
        },
        {
          provide: GenerateFullNameGreetingUseCase,
          useValue: { execute: executeFullName },
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

  it('delegates a full-name request to its use case', () => {
    executeFullName.mockReturnValue({ message: 'Hola Marco Gallegos' });

    expect(
      controller.createFullName({ name: 'Marco', lastName: 'Gallegos' }),
    ).toEqual({
      message: 'Hola Marco Gallegos',
    });
    expect(executeFullName).toHaveBeenCalledWith({
      name: 'Marco',
      lastName: 'Gallegos',
    });
  });
});
