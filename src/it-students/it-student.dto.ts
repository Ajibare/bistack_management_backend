import { IsString, IsNumber, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateItStudentDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() university: string;
  @IsString() @IsNotEmpty() department: string;
  @IsString() @IsNotEmpty() level: string;
  @Type(() => Number) @IsNumber() feeToPay: number;
  @Type(() => Number) @IsNumber() amountPaid: number;
  @Type(() => Number) @IsNumber() balance: number;
  @IsString() @IsNotEmpty() date: string;
  @IsBoolean() @IsOptional() @Type(() => Boolean) completed?: boolean;
  @IsBoolean() @IsOptional() @Type(() => Boolean) certificateIssued?: boolean;
}

export class UpdateItStudentDto extends CreateItStudentDto {}
