/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString, IsUrl, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class MuseumDto {
  @IsString() @IsNotEmpty()
  readonly name: string;

  @IsString() @IsNotEmpty()
  readonly description: string;

  @IsString() @IsNotEmpty()
  readonly address: string;

  @IsString() @IsNotEmpty()
  readonly city: string;

  @IsUrl() @IsNotEmpty()
  readonly image: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  readonly foundedBefore?: number;
}
