import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CustomerOrder } from '../../orders/entities/order.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn() id: number;
  @Column() fullName: string;
  @Column({ unique: true }) email: string;
  @OneToMany(() => CustomerOrder, (o) => o.client) orders: CustomerOrder[];
}