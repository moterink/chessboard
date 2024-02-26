import { ActiveColors, Colors } from './types';

export class InvalidAttributeValueError extends Error {
  constructor(attribute: string, value: string, allowed: readonly string[]) {
    super(
      `invalid value for attribute ${attribute}: "${value}", expected ${allowed
        .map((a) => `"${a}"`)
        .join(' or ')}`,
    );
    this.name = this.constructor.name;
  }
}

export class UnknownAttributeError extends Error {
  constructor(attribute: string) {
    super(`received unknown attribute ${attribute}`);
    this.name = this.constructor.name;
  }
}

export class PieceNotFoundError extends Error {
  constructor(square: string) {
    super(`no piece found at square ${square}`);
    this.name = this.constructor.name;
  }
}

export const ValidAttributeValues: Record<string, readonly string[]> = {
  active: ActiveColors,
  orientation: Colors,
};

export const checkArgumentValueValid = (attribute: string, value: string) => {
  const allowedValues = ValidAttributeValues[attribute];
  if (
    allowedValues !== undefined &&
    !Object.values(allowedValues).includes(value)
  ) {
    throw new InvalidAttributeValueError(attribute, value, allowedValues);
  }
};
