import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { CustomerOrder } from '../orders/entities/order.entity';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

@Module({
  imports: [TypeOrmModule.forFeature([Client, CustomerOrder])],
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule {}