import { IsString, IsNumber, IsNotEmpty, IsEmail, IsBoolean, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHubSubscriptionDto {
  @IsString() @IsNotEmpty() name: string;
  @IsEmail() @IsNotEmpty() email: string;
  @Type(() => Number) @IsNumber() amountPaid: number;
  @IsString() @IsOptional() duration?: string;
  @IsBoolean() @Type(() => Boolean) isMonthly: boolean;
  @Type(() => Number) @IsOptional() @IsNumber() @Min(1) months?: number;
  @IsString() @IsNotEmpty() date: string;
  @IsString() @IsNotEmpty() expiresAt: string;
}

export class UpdateHubSubscriptionDto extends CreateHubSubscriptionDto {}
