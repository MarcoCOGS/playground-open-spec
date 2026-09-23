import { Module } from '@nestjs/common';
import { GenerateFullNameGreetingUseCase } from './application/generate-full-name-greeting.use-case.js';
import { GenerateGreetingUseCase } from './application/generate-greeting.use-case.js';
import { GreetingsController } from './infrastructure/http/greetings.controller.js';

@Module({
  controllers: [GreetingsController],
  providers: [GenerateGreetingUseCase, GenerateFullNameGreetingUseCase],
})
export class GreetingsModule {}
