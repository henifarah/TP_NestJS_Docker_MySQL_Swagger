import { describe, it, expect, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { ClientsService } from './clients.service';

vi.mock('./entities/client.entity', () => ({ Client: class Client {} }));
vi.mock('../orders/entities/order.entity', () => ({ CustomerOrder: class CustomerOrder {} }));

describe('ClientsService.findOrders', () => {
  it('charge les commandes du client avec leurs lignes et produits', async () => {
    const clients: any = { findOneBy: vi.fn().mockResolvedValue({ id: 1 }) };
    const orders: any = { find: vi.fn().mockResolvedValue([{ id: 1 }]) };

    const result = await new ClientsService(clients, orders).findOrders(1);

    expect(result).toEqual([{ id: 1 }]);
    expect(orders.find).toHaveBeenCalledWith(expect.objectContaining({
      where: { clientId: 1 },
      relations: { items: { product: true } },
    }));
  });

  it('renvoie 404 si le client n existe pas', async () => {
    const clients: any = { findOneBy: vi.fn().mockResolvedValue(null) };
    const orders: any = { find: vi.fn() };

    await expect(new ClientsService(clients, orders).findOrders(99))
      .rejects.toThrow(NotFoundException);
    expect(orders.find).not.toHaveBeenCalled();
  });
});