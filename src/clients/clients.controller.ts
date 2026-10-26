import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { ClientResponseDto } from './dto/client-response.dto';
import { OrderResponseDto } from '../orders/dto/order-response.dto';

@ApiTags('Clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly service: ClientsService) {}

  @Post() @ApiOperation({ summary: 'Creer un client' })
  @ApiResponse({ status: 201, type: ClientResponseDto })
  @ApiResponse({ status: 400, description: 'Donnees invalides (email...)' })
  create(@Body() dto: CreateClientDto) { return this.service.create(dto); }

  @Get() @ApiOperation({ summary: 'Lister les clients' })
  @ApiResponse({ status: 200, type: [ClientResponseDto] })
  findAll() { return this.service.findAll(); }

  @Get(':id') @ApiOperation({ summary: 'Detail d un client' })
  @ApiResponse({ status: 200, type: ClientResponseDto })
  @ApiResponse({ status: 404, description: 'Client introuvable' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Get(':id/orders') @ApiOperation({ summary: 'Commandes d un client avec leurs lignes' })
  @ApiResponse({ status: 200, type: [OrderResponseDto] })
  @ApiResponse({ status: 404, description: 'Client introuvable' })
  findOrders(@Param('id', ParseIntPipe) id: number) { return this.service.findOrders(id); }
}