import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidPage', async: false })
export class IsValidPageConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    const num = parseInt(value, 10);
    return !isNaN(num) && num >= 1;
  }

  defaultMessage(): string {
    return 'Page must be a number >= 1';
  }
}

@ValidatorConstraint({ name: 'isValidLimit', async: false })
export class IsValidLimitConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    const num = parseInt(value, 10);
    return !isNaN(num) && num >= 1 && num <= 100;
  }

  defaultMessage(): string {
    return 'Limit must be a number between 1 and 100';
  }
}

export function IsValidPage(validationOptions?: ValidationOptions) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidPageConstraint,
    });
  };
}

export function IsValidLimit(validationOptions?: ValidationOptions) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidLimitConstraint,
    });
  };
}
