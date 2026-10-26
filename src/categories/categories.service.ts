import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { Product } from '../products/entities/product.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private readonly repo: Repository<Category>,
    @InjectRepository(Product) private readonly products: Repository<Product>,
  ) {}

  create(dto: CreateCategoryDto) { return this.repo.save(this.repo.create(dto)); }

  findAll() { return this.repo.find({ relations: { products: true } }); }

  async findOne(id: number) {
    const c = await this.repo.findOne({ where: { id }, relations: { products: true } });
    if (!c) throw new NotFoundException('Categorie introuvable');
    return c;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const c = await this.findOne(id);
    if (dto.name !== undefined && dto.name !== c.name) {
      const exists = await this.repo.findOneBy({ name: dto.name });
      if (exists) throw new ConflictException('Nom de categorie deja utilise');
      await this.repo.update(id, { name: dto.name });
    }
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    const count = await this.products.count({ where: { categoryId: id } });
    if (count > 0)
      throw new ConflictException('Categorie contenant des produits : suppression refusee');
    await this.repo.delete(id);
    return { deleted: true, id };
  }
}