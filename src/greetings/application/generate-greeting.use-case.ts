import { Greeting } from '../domain/greeting.js';
import { Name } from '../domain/name.js';

export interface GenerateGreetingInput {
  name: string;
}

export interface GenerateGreetingOutput {
  message: string;
}

export class GenerateGreetingUseCase {
  execute(input: GenerateGreetingInput): GenerateGreetingOutput {
    const name = Name.create(input.name);
    const greeting = Greeting.for(name);

    return { message: greeting.message };
  }
}
