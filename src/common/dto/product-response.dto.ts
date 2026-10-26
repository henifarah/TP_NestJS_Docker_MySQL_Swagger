import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ example: 1 }) id: number;
  @ApiProperty({ example: 'Clavier' }) name: string;
  @ApiProperty({ example: '100.50', description: 'Decimal renvoye en texte par MySQL' }) price: string;
  @ApiProperty({ example: 8 }) stock: number;
  @ApiProperty({ example: 1 }) categoryId: number;
}

export class PaginatedProductsDto {
  @ApiProperty({ type: [ProductResponseDto] }) data: ProductResponseDto[];
  @ApiProperty({ example: 25 }) total: number;
  @ApiProperty({ example: 1 }) page: number;
  @ApiProperty({ example: 10 }) limit: number;
  @ApiProperty({ example: 3 }) totalPages: number;
}