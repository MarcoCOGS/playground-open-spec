import { BadRequestException } from '@nestjs/common';
import { createFullNameGreetingSchema } from './create-full-name-greeting.schema.js';
import { JoiValidationPipe } from './joi-validation.pipe.js';

const metadata = {
  data: undefined,
  metatype: Object,
  type: 'body' as const,
};

describe('createFullNameGreetingSchema', () => {
  const pipe = new JoiValidationPipe(createFullNameGreetingSchema);

  it('accepts Unicode name components with single spaces', () => {
    expect(
      pipe.transform({ name: 'José María', lastName: 'De la Cruz' }, metadata),
    ).toEqual({
      name: 'José María',
      lastName: 'De la Cruz',
    });
  });

  it.each([
    ['name', { name: 'Mara', lastName: 'Gallegos' }],
    ['name', { name: 12345, lastName: 'Gallegos' }],
    ['name', { lastName: 'Gallegos' }],
    ['lastName', { name: 'Marco', lastName: 'Paz' }],
    ['lastName', { name: 'Marco', lastName: 'Gallegos1' }],
    ['lastName', { name: 'Marco', lastName: 'Gallegos#' }],
    ['lastName', { name: 'Marco', lastName: 12345 }],
    ['lastName', { name: 'Marco' }],
  ])('maps an invalid %s to a BadRequestException', (field, value) => {
    try {
      pipe.transform(value, metadata);
      fail('Expected validation to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);

      const response = (error as BadRequestException).getResponse() as {
        message: string[];
        statusCode: number;
      };

      expect(response.statusCode).toBe(400);
      expect(response.message.join(' ')).toContain(field);
    }
  });
});
