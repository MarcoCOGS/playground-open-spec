import { Greeting } from '../domain/greeting.js';
import { Name } from '../domain/name.js';

export interface GenerateFullNameGreetingInput {
  name: string;
  lastName: string;
}

export interface GenerateFullNameGreetingOutput {
  message: string;
}

export class GenerateFullNameGreetingUseCase {
  execute(
    input: GenerateFullNameGreetingInput,
  ): GenerateFullNameGreetingOutput {
    const name = Name.create(input.name);
    const lastName = Name.create(input.lastName);
    const greeting = Greeting.forFullName(name, lastName);

    return { message: greeting.message };
  }
}
