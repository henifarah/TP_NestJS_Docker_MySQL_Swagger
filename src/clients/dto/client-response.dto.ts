import { ApiProperty } from '@nestjs/swagger';

export class ClientResponseDto {
  @ApiProperty({ example: 1 }) id: number;
  @ApiProperty({ example: 'Amira Ben Ali' }) fullName: string;
  @ApiProperty({ example: 'amira@example.com' }) email: string;
}
