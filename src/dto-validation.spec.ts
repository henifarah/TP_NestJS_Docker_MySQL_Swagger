import 'reflect-metadata';
import { describe, it, expect } from 'vitest';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateOrderDto } from './orders/dto/create-order.dto';
import { CreateProductDto } from './products/dto/create-product.dto';

const check = (cls: any, plain: object) => validate(plainToInstance(cls, plain));

describe('Validation des DTO', () => {
  it('accepte une commande valide', async () => {
    const errors = await check(CreateOrderDto, {
      clientId: 1, items: [{ productId: 1, quantity: 2 }],
    });
    expect(errors).toHaveLength(0);
  });

  it('refuse une commande sans lignes (items vide)', async () => {
    const errors = await check(CreateOrderDto, { clientId: 1, items: [] });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('refuse une quantite 0 dans une ligne (validation imbriquee)', async () => {
    const errors = await check(CreateOrderDto, {
      clientId: 1, items: [{ productId: 1, quantity: 0 }],
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('refuse un prix negatif', async () => {
    const errors = await check(CreateProductDto, {
      name: 'Clavier', price: -5, stock: 1, categoryId: 1,
    });
    expect(errors.length).toBeGreaterThan(0);
  });
});