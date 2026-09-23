import { Test } from '@nestjs/testing';
import { GenerateFullNameGreetingUseCase } from './application/generate-full-name-greeting.use-case.js';
import { GenerateGreetingUseCase } from './application/generate-greeting.use-case.js';
import { GreetingsModule } from './greetings.module.js';

describe('GreetingsModule', () => {
  it('composes both greeting use cases', async () => {
    const module = await Test.createTestingModule({
      imports: [GreetingsModule],
    }).compile();

    expect(module.get(GenerateGreetingUseCase)).toBeInstanceOf(
      GenerateGreetingUseCase,
    );
    expect(module.get(GenerateFullNameGreetingUseCase)).toBeInstanceOf(
      GenerateFullNameGreetingUseCase,
    );
  });
});
