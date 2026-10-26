import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { Client } from '../clients/entities/client.entity';
import { Product } from '../products/entities/product.entity';
import { CustomerOrder } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

@Injectable()
export class OrdersService {
  constructor(private readonly dataSource: DataSource) {}

  async create(dto: CreateOrderDto) {
    return this.dataSource.transaction(async (manager) => {
      const client = await manager.findOneBy(Client, { id: dto.clientId });
      if (!client) throw new NotFoundException('Client introuvable');

      const ids = dto.items.map((i) => i.productId);
      if (new Set(ids).size !== ids.length)
        throw new BadRequestException('Produit duplique dans la commande');

      // Mise a jour conditionnelle atomique du stock, ids tries pour limiter les deadlocks.
      const byId = new Map(dto.items.map((i) => [i.productId, i]));
      const snapshots = new Map<number, Product>();
      for (const id of [...ids].sort((a, b) => a - b)) {
        const input = byId.get(id)!;
        const product = await manager.findOneBy(Product, { id });
        if (!product) throw new NotFoundException(`Produit ${id} introuvable`);
        const update = await manager.createQueryBuilder()
          .update(Product)
          .set({ stock: () => `stock - ${input.quantity}` })
          .where('id = :id AND stock >= :qty', { id, qty: input.quantity })
          .execute();
        if (update.affected !== 1)
          throw new BadRequestException(`Stock insuffisant: ${id}`);
        snapshots.set(id, product);
      }

      const cents = dto.items.reduce((sum, line) => {
        const p = snapshots.get(line.productId)!;
        return sum + Math.round(Number(p.price) * 100) * line.quantity;
      }, 0);

      const order = await manager.save(CustomerOrder, manager.create(CustomerOrder, {
        clientId: client.id, total: (cents / 100).toFixed(2), status: 'CREATED',
      }));

      for (const line of dto.items) {
        const product = snapshots.get(line.productId)!;
        await manager.save(OrderItem, manager.create(OrderItem, {
          orderId: order.id, productId: product.id,
          quantity: line.quantity, unitPrice: product.price,
        }));
      }

      return manager.findOneOrFail(CustomerOrder, {
        where: { id: order.id },
        relations: { client: true, items: { product: true } },
      });
    });
  }

  findAll() {
    return this.dataSource.getRepository(CustomerOrder).find({
      relations: { client: true, items: { product: true } },
    });
  }

  async cancel(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(CustomerOrder, {
        where: { id }, relations: { items: true },
      });
      if (!order) throw new NotFoundException('Commande introuvable');

      // On "reserve" l'annulation de facon atomique : une seule requete peut reussir,
      // ce qui evite de restaurer le stock deux fois en cas d'appels simultanes.
      const res = await manager.update(CustomerOrder, { id, status: 'CREATED' }, { status: 'CANCELLED' });
      if (res.affected !== 1)
        throw new BadRequestException('Commande deja annulee ou non annulable');

      for (const item of [...order.items].sort((a, b) => a.productId - b.productId)) {
        await manager.increment(Product, { id: item.productId }, 'stock', item.quantity);
      }

      return manager.findOneOrFail(CustomerOrder, {
        where: { id }, relations: { client: true, items: { product: true } },
      });
    });
  }
}