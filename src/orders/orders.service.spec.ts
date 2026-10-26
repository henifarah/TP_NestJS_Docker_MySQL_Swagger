import { describe, it, expect, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Client } from '../clients/entities/client.entity';
import { Product } from '../products/entities/product.entity';
import { CustomerOrder } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

// Entites remplacees par de simples classes : on teste la logique, pas TypeORM.
vi.mock('../clients/entities/client.entity', () => ({ Client: class Client {} }));
vi.mock('../products/entities/product.entity', () => ({ Product: class Product {} }));
vi.mock('./entities/order.entity', () => ({ CustomerOrder: class CustomerOrder {} }));
vi.mock('./entities/order-item.entity', () => ({ OrderItem: class OrderItem {} }));

const products: Record<number, any> = {
  1: { id: 1, price: '100.50', stock: 8 },
  2: { id: 2, price: '40.00', stock: 12 },
};

// stockOk = false simule un UPDATE conditionnel qui ne modifie aucune ligne.
function makeManager(stockOk = true) {
  const manager: any = {
    findOneBy: vi.fn(async (entity: any, where: any) => {
      if (entity === Client) return where.id === 1 ? { id: 1 } : null;
      if (entity === Product) return products[where.id] ?? null;
      return null;
    }),
    createQueryBuilder: vi.fn(() => {
      const qb: any = {
        update: () => qb, set: () => qb, where: () => qb,
        execute: async () => ({ affected: stockOk ? 1 : 0 }),
      };
      return qb;
    }),
    create: vi.fn((_e: any, data: any) => data),
    save: vi.fn(async (entity: any, data: any) =>
      entity === CustomerOrder ? { id: 1, ...data } : data),
    findOneOrFail: vi.fn(async () => ({ id: 1, status: 'CREATED', total: '321.00' })),
    findOne: vi.fn(),
    update: vi.fn(),
    increment: vi.fn(),
  };
  return manager;
}

const makeService = (manager: any) =>
  new OrdersService({ transaction: (cb: any) => cb(manager) } as any);

const validDto = {
  clientId: 1,
  items: [{ productId: 1, quantity: 2 }, { productId: 2, quantity: 3 }],
};

describe('OrdersService.create', () => {
  it('cree la commande avec le bon total (321.00) et 2 lignes', async () => {
    const manager = makeManager();
    await makeService(manager).create(validDto as any);

    const orderCall = manager.save.mock.calls.find((c: any[]) => c[0] === CustomerOrder);
    expect(orderCall[1].total).toBe('321.00');
    const itemCalls = manager.save.mock.calls.filter((c: any[]) => c[0] === OrderItem);
    expect(itemCalls).toHaveLength(2);
    expect(itemCalls[0][1].unitPrice).toBe('100.50'); // prix fige dans la ligne
  });

  it('refuse si le stock est insuffisant et n enregistre rien (transaction)', async () => {
    const manager = makeManager(false);
    await expect(makeService(manager).create(validDto as any))
      .rejects.toThrow(BadRequestException);
    expect(manager.save).not.toHaveBeenCalled();
  });

  it('refuse un produit duplique', async () => {
    const manager = makeManager();
    const dto = { clientId: 1, items: [{ productId: 1, quantity: 1 }, { productId: 1, quantity: 2 }] };
    await expect(makeService(manager).create(dto as any)).rejects.toThrow(BadRequestException);
    expect(manager.save).not.toHaveBeenCalled();
  });

  it('renvoie 404 si le client n existe pas', async () => {
    const manager = makeManager();
    await expect(makeService(manager).create({ ...validDto, clientId: 99 } as any))
      .rejects.toThrow(NotFoundException);
  });
});

describe('OrdersService.cancel', () => {
  it('restaure le stock de chaque ligne', async () => {
    const manager = makeManager();
    manager.findOne.mockResolvedValue({
      id: 1, items: [{ productId: 1, quantity: 2 }, { productId: 2, quantity: 3 }],
    });
    manager.update.mockResolvedValue({ affected: 1 });

    await makeService(manager).cancel(1);

    expect(manager.increment).toHaveBeenCalledWith(Product, { id: 1 }, 'stock', 2);
    expect(manager.increment).toHaveBeenCalledWith(Product, { id: 2 }, 'stock', 3);
  });

  it('refuse d annuler deux fois et ne touche pas au stock', async () => {
    const manager = makeManager();
    manager.findOne.mockResolvedValue({ id: 1, items: [{ productId: 1, quantity: 2 }] });
    manager.update.mockResolvedValue({ affected: 0 });

    await expect(makeService(manager).cancel(1)).rejects.toThrow(BadRequestException);
    expect(manager.increment).not.toHaveBeenCalled();
  });
});