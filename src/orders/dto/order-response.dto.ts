import { ApiProperty } from '@nestjs/swagger';

export class OrderItemResponseDto {
  @ApiProperty({ example: 1 }) id: number;
  @ApiProperty({ example: 2 }) quantity: number;
  @ApiProperty({ example: '100.50' }) unitPrice: string;
  @ApiProperty({ example: 1 }) productId: number;
}

export class OrderResponseDto {
  @ApiProperty({ example: 1 }) id: number;
  @ApiProperty({ example: 'CREATED', enum: ['CREATED', 'CANCELLED'] }) status: string;
  @ApiProperty({ example: '321.00' }) total: string;
  @ApiProperty({ example: '2026-10-26T10:00:00.000Z' }) createdAt: Date;
  @ApiProperty({ example: 1 }) clientId: number;
  @ApiProperty({ type: [OrderItemResponseDto] }) items: OrderItemResponseDto[];
}
