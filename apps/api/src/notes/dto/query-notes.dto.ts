import { IsOptional, IsString, MaxLength } from 'class-validator';

export class QueryNotesDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  tag?: string;
}
