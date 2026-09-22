import { Name } from './name.js';

export class Greeting {
  private constructor(readonly message: string) {}

  static for(name: Name): Greeting {
    return new Greeting(`Hola ${name.value}`);
  }
}
