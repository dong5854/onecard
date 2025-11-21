import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class OnnxHealthQueryDto {
  @IsInt()
  @Min(2)
  @Max(4)
  public players!: number;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  public includeJokers!: boolean;

  @IsInt()
  @Min(1)
  @Max(30)
  public initHandSize!: number;

  @IsInt()
  @Min(1)
  @Max(50)
  public maxHandSize!: number;

  @IsOptional()
  @IsIn(['easy', 'medium', 'hard'])
  public difficulty?: 'easy' | 'medium' | 'hard';
}
