import { Name } from './name.js';

export class Greeting {
  private constructor(readonly message: string) {}

  static for(name: Name): Greeting {
    return new Greeting(`Hola ${name.value}`);
  }

  static forFullName(name: Name, lastName: Name): Greeting {
    return new Greeting(`Hola ${name.value} ${lastName.value}`);
  }
}
