import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidLatitude', async: false })
export class IsValidLatitudeConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    const num = parseFloat(value);
    return !isNaN(num) && num >= -90 && num <= 90;
  }

  defaultMessage(): string {
    return 'Latitude must be a number between -90 and 90';
  }
}

@ValidatorConstraint({ name: 'isValidLongitude', async: false })
export class IsValidLongitudeConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    const num = parseFloat(value);
    return !isNaN(num) && num >= -180 && num <= 180;
  }

  defaultMessage(): string {
    return 'Longitude must be a number between -180 and 180';
  }
}

export function IsValidLatitude(validationOptions?: ValidationOptions) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidLatitudeConstraint,
    });
  };
}

export function IsValidLongitude(validationOptions?: ValidationOptions) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidLongitudeConstraint,
    });
  };
}
