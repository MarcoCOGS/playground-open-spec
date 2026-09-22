export const NAME_MIN_LENGTH = 5;
export const NAME_MAX_LENGTH = 20;
export const NAME_PATTERN = /^\p{L}+(?: \p{L}+)*$/u;

export class InvalidNameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidNameError';
  }
}

export class Name {
  private constructor(readonly value: string) {}

  static create(value: string): Name {
    if (value.length < NAME_MIN_LENGTH || value.length > NAME_MAX_LENGTH) {
      throw new InvalidNameError(
        `name must contain between ${NAME_MIN_LENGTH} and ${NAME_MAX_LENGTH} characters`,
      );
    }

    if (!NAME_PATTERN.test(value)) {
      throw new InvalidNameError(
        'name must contain only Unicode letters separated by single spaces',
      );
    }

    return new Name(value);
  }
}
