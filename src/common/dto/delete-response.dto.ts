import { ApiProperty } from '@nestjs/swagger';

export class DeleteResponseDto {
  @ApiProperty({ example: true }) deleted: boolean;
  @ApiProperty({ example: 1 }) id: number;
}