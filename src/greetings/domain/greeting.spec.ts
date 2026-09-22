import { Greeting } from './greeting.js';
import { Name } from './name.js';

describe('Greeting', () => {
  it('builds a Spanish greeting from a name', () => {
    expect(Greeting.for(Name.create('Marco')).message).toBe('Hola Marco');
  });
});
