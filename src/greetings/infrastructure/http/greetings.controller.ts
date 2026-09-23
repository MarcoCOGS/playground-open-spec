import { Body, Controller, Post } from '@nestjs/common';
import { GenerateFullNameGreetingUseCase } from '../../application/generate-full-name-greeting.use-case.js';
import type { GenerateFullNameGreetingOutput } from '../../application/generate-full-name-greeting.use-case.js';
import { GenerateGreetingUseCase } from '../../application/generate-greeting.use-case.js';
import type { GenerateGreetingOutput } from '../../application/generate-greeting.use-case.js';
import { createFullNameGreetingSchema } from './create-full-name-greeting.schema.js';
import type { CreateFullNameGreetingRequest } from './create-full-name-greeting.request.js';
import { createGreetingSchema } from './create-greeting.schema.js';
import type { CreateGreetingRequest } from './create-greeting.request.js';
import { JoiValidationPipe } from './joi-validation.pipe.js';

@Controller('greetings')
export class GreetingsController {
  constructor(
    private readonly generateGreetingUseCase: GenerateGreetingUseCase,
    private readonly generateFullNameGreetingUseCase: GenerateFullNameGreetingUseCase,
  ) {}

  @Post()
  create(
    @Body(new JoiValidationPipe(createGreetingSchema)) request: CreateGreetingRequest,
  ): GenerateGreetingOutput {
    return this.generateGreetingUseCase.execute(request);
  }

  @Post('full-name')
  createFullName(
    @Body(new JoiValidationPipe(createFullNameGreetingSchema))
    request: CreateFullNameGreetingRequest,
  ): GenerateFullNameGreetingOutput {
    return this.generateFullNameGreetingUseCase.execute(request);
  }
}
