import { Test } from '@nestjs/testing';
import { GenerateGreetingUseCase } from './application/generate-greeting.use-case.js';
import { GreetingsModule } from './greetings.module.js';

describe('GreetingsModule', () => {
  it('composes the greeting use case', async () => {
    const module = await Test.createTestingModule({
      imports: [GreetingsModule],
    }).compile();

    expect(module.get(GenerateGreetingUseCase)).toBeInstanceOf(
      GenerateGreetingUseCase,
    );
  });
});
