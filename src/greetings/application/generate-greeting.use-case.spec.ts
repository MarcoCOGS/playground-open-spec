import { GenerateGreetingUseCase } from './generate-greeting.use-case.js';

describe('GenerateGreetingUseCase', () => {
  it('returns a greeting for a valid name', () => {
    const useCase = new GenerateGreetingUseCase();

    expect(useCase.execute({ name: 'Marco' })).toEqual({
      message: 'Hola Marco',
    });
  });
});
