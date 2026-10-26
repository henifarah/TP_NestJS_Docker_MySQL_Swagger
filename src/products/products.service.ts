import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListProductsQueryDto } from './dto/list-products-query.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(Category) private readonly cats: Repository<Category>,
    @InjectRepository(OrderItem) private readonly items: Repository<OrderItem>,
  ) {}

  async create(dto: CreateProductDto) {
    const category = await this.cats.findOneBy({ id: dto.categoryId });
    if (!category) throw new NotFoundException('Categorie introuvable');
    return this.products.save(this.products.create({
      name: dto.name, price: dto.price.toFixed(2), stock: dto.stock, category,
    }));
  }

  async findAll(q: ListProductsQueryDto) {
    const [data, total] = await this.products.findAndCount({
      where: q.categoryId ? { categoryId: q.categoryId } : {},
      relations: { category: true },
      order: { id: 'ASC' },
      skip: (q.page - 1) * q.limit,
      take: q.limit,
    });
    return { data, total, page: q.page, limit: q.limit, totalPages: Math.ceil(total / q.limit) };
  }

  async findOne(id: number) {
    const product = await this.products.findOne({ where: { id }, relations: { category: true } });
    if (!product) throw new NotFoundException('Produit introuvable');
    return product;
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.findOne(id);
    if (dto.categoryId !== undefined) {
      const category = await this.cats.findOneBy({ id: dto.categoryId });
      if (!category) throw new NotFoundException('Categorie introuvable');
      product.category = category;
      product.categoryId = category.id;
    }
    if (dto.name !== undefined) product.name = dto.name;
    if (dto.price !== undefined) product.price = dto.price.toFixed(2);
    if (dto.stock !== undefined) product.stock = dto.stock;
    await this.products.save(product);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    const lines = await this.items.count({ where: { productId: id } });
    if (lines > 0)
      throw new ConflictException('Produit utilise dans des commandes : suppression refusee');
    await this.products.delete(id);
    return { deleted: true, id };
  }
}