import { Module } from '@nestjs/common';
import { GenerateGreetingUseCase } from './application/generate-greeting.use-case.js';
import { GreetingsController } from './infrastructure/http/greetings.controller.js';

@Module({
  controllers: [GreetingsController],
  providers: [GenerateGreetingUseCase],
})
export class GreetingsModule {}
