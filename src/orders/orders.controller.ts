import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Post() @ApiOperation({ summary: 'Commander avec verification du stock' })
  @ApiResponse({ status: 201, description: 'Commande creee, stock decremente', type: OrderResponseDto })
  @ApiResponse({ status: 400, description: 'Stock insuffisant, produit duplique ou donnees invalides' })
  @ApiResponse({ status: 404, description: 'Client ou produit introuvable' })
  create(@Body() dto: CreateOrderDto) { return this.service.create(dto); }

  @Get() @ApiOperation({ summary: 'Lister les commandes' })
  @ApiResponse({ status: 200, type: [OrderResponseDto] })
  findAll() { return this.service.findAll(); }

  @Patch(':id/cancel') @ApiOperation({ summary: 'Annuler une commande et restaurer le stock' })
  @ApiResponse({ status: 200, description: 'Commande annulee, stock restaure', type: OrderResponseDto })
  @ApiResponse({ status: 400, description: 'Commande deja annulee' })
  @ApiResponse({ status: 404, description: 'Commande introuvable' })
  cancel(@Param('id', ParseIntPipe) id: number) { return this.service.cancel(id); }
}