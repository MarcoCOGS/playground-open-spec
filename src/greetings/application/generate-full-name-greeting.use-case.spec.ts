import { InvalidNameError } from '../domain/name.js';
import { GenerateFullNameGreetingUseCase } from './generate-full-name-greeting.use-case.js';

describe('GenerateFullNameGreetingUseCase', () => {
  const useCase = new GenerateFullNameGreetingUseCase();

  it('returns a greeting for a valid name and last name', () => {
    expect(
      useCase.execute({ name: 'Marco', lastName: 'Gallegos' }),
    ).toEqual({
      message: 'Hola Marco Gallegos',
    });
  });

  it.each([
    { name: 'Mara', lastName: 'Gallegos' },
    { name: 'Marco', lastName: 'Paz' },
  ])('preserves domain validation errors for %o', (input) => {
    expect(() => useCase.execute(input)).toThrow(InvalidNameError);
  });
});
