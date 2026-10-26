import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerOrder } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { Client } from '../clients/entities/client.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerOrder, OrderItem, Product, Client])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}