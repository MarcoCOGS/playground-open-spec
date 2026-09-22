import {
  InvalidNameError,
  Name,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
} from './name.js';

describe('Name', () => {
  it.each([
    'Marco',
    'José María',
    'abcdefghijklmnopqrst',
  ])('creates a valid name: %s', (value) => {
    expect(Name.create(value).value).toBe(value);
  });

  it.each([
    'Mara',
    'abcdefghijklmnopqrstu',
    'Marco1',
    'Marco#',
    'Marco  Polo',
    ' Marco',
    'Marco ',
  ])('rejects an invalid name: %s', (value) => {
    expect(() => Name.create(value)).toThrow(InvalidNameError);
  });

  it('exposes the configured length bounds', () => {
    expect(NAME_MIN_LENGTH).toBe(5);
    expect(NAME_MAX_LENGTH).toBe(20);
  });
});
