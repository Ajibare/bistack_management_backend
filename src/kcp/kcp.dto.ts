import { IsString, IsNumber, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateKcpDto {
  @IsString() @IsNotEmpty() name: string;
  @Type(() => Number) @IsNumber() feeToPay: number;
  @Type(() => Number) @IsNumber() amountPaid: number;
  @Type(() => Number) @IsNumber() balance: number;
  @IsString() @IsNotEmpty() date: string;
  @IsString() @IsNotEmpty() age: string;
  @IsBoolean() @IsOptional() @Type(() => Boolean) completed?: boolean;
  @IsBoolean() @IsOptional() @Type(() => Boolean) certificateIssued?: boolean;
}

export class UpdateKcpDto extends CreateKcpDto {}
