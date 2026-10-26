import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CustomerOrder } from './order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn() id: number;
  @Column('int') quantity: number;
  @Column('decimal', { precision: 10, scale: 2 }) unitPrice: string;
  @ManyToOne(() => CustomerOrder, (o) => o.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' }) order: CustomerOrder;
  @Column() orderId: number;
  @ManyToOne(() => Product, (p) => p.items, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'productId' }) product: Product;
  @Column() productId: number;
}