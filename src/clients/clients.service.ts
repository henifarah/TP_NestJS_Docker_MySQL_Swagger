import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CustomerOrder } from '../orders/entities/order.entity';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client) private readonly repo: Repository<Client>,
    @InjectRepository(CustomerOrder) private readonly orders: Repository<CustomerOrder>,
  ) {}

  create(dto: CreateClientDto) { return this.repo.save(this.repo.create(dto)); }

  findAll() { return this.repo.find(); }

  async findOne(id: number) {
    const c = await this.repo.findOneBy({ id });
    if (!c) throw new NotFoundException('Client introuvable');
    return c;
  }

  async findOrders(id: number) {
    await this.findOne(id);
    return this.orders.find({
      where: { clientId: id },
      relations: { items: { product: true } },
      order: { id: 'DESC' },
    });
  }
}