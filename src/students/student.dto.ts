import { IsString, IsNumber, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStudentDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() course: string;
  @IsString() @IsNotEmpty() tutor: string;
  @Type(() => Number) @IsNumber() amountPaid: number;
  @Type(() => Number) @IsNumber() balance: number;
  @Type(() => Number) @IsNumber() feeToPay: number;
  @IsString() @IsNotEmpty() duration: string;
  @IsString() @IsNotEmpty() date: string;
  @IsBoolean() @IsOptional() @Type(() => Boolean) completed?: boolean;
  @IsBoolean() @IsOptional() @Type(() => Boolean) certificateIssued?: boolean;
}

export class UpdateStudentDto extends CreateStudentDto {}
