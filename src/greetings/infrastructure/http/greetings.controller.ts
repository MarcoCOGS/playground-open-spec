import { Body, Controller, Post } from '@nestjs/common';
import { GenerateGreetingUseCase } from '../../application/generate-greeting.use-case.js';
import type { GenerateGreetingOutput } from '../../application/generate-greeting.use-case.js';
import { createGreetingSchema } from './create-greeting.schema.js';
import type { CreateGreetingRequest } from './create-greeting.request.js';
import { JoiValidationPipe } from './joi-validation.pipe.js';

@Controller('greetings')
export class GreetingsController {
  constructor(private readonly generateGreetingUseCase: GenerateGreetingUseCase) {}

  @Post()
  create(
    @Body(new JoiValidationPipe(createGreetingSchema)) request: CreateGreetingRequest,
  ): GenerateGreetingOutput {
    return this.generateGreetingUseCase.execute(request);
  }
}
