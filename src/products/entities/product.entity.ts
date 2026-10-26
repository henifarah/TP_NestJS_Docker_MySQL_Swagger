import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn() id: number;
  @Column() name: string;
  @Column('decimal', { precision: 10, scale: 2 }) price: string;
  @Column('int', { default: 0 }) stock: number;
  @ManyToOne(() => Category, (c) => c.products, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'categoryId' }) category: Category;
  @Column() categoryId: number;
  @OneToMany(() => OrderItem, (item) => item.product) items: OrderItem[];
}