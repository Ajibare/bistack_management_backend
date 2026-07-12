import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
} from 'class-validator';

const STAFF_STATUSES = ['Active', 'Inactive', 'Suspended'] as const;

export class CreateStaffDto {
  @IsString() @IsNotEmpty() firstName: string;
  @IsString() @IsNotEmpty() lastName: string;
  @IsString() @IsNotEmpty()
  role: string;

  @IsString() @IsOptional() assignedClasses?: string;
  @IsString() @IsOptional() phone?: string;
  @IsString() @IsOptional() email?: string;
  @IsString() @IsOptional() address?: string;

  @IsString() @IsIn([...STAFF_STATUSES])
  @IsOptional()
  status?: string;

  @IsString() @IsNotEmpty() date: string;
}

export class UpdateStaffDto {
  @IsString() @IsNotEmpty() firstName: string;
  @IsString() @IsNotEmpty() lastName: string;
  @IsString() @IsNotEmpty()
  role: string;

  @IsString() @IsOptional() assignedClasses?: string;
  @IsString() @IsOptional() phone?: string;
  @IsString() @IsOptional() email?: string;
  @IsString() @IsOptional() address?: string;

  @IsString() @IsIn([...STAFF_STATUSES])
  @IsOptional()
  status?: string;

  @IsString() @IsNotEmpty() date: string;
}

export { STAFF_STATUSES };
