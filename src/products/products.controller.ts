import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { PaginatedProductsDto, ProductResponseDto } from './dto/product-response.dto';
import { DeleteResponseDto } from '../common/dto/delete-response.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Post() @ApiOperation({ summary: 'Ajouter un produit a une categorie' })
  @ApiResponse({ status: 201, description: 'Produit cree', type: ProductResponseDto })
  @ApiResponse({ status: 400, description: 'Donnees invalides (prix negatif...)' })
  @ApiResponse({ status: 404, description: 'Categorie introuvable' })
  create(@Body() dto: CreateProductDto) { return this.service.create(dto); }

  @Get() @ApiOperation({ summary: 'Lister les produits (filtre categoryId, pagination)' })
  @ApiResponse({ status: 200, type: PaginatedProductsDto })
  @ApiResponse({ status: 400, description: 'Parametres de requete invalides' })
  findAll(@Query() q: ListProductsQueryDto) { return this.service.findAll(q); }

  @Get(':id') @ApiOperation({ summary: 'Detail d un produit' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Produit introuvable' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Patch(':id') @ApiOperation({ summary: 'Modifier un produit' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  @ApiResponse({ status: 400, description: 'Donnees invalides' })
  @ApiResponse({ status: 404, description: 'Produit ou categorie introuvable' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id') @ApiOperation({ summary: 'Supprimer un produit (refuse si deja commande)' })
  @ApiResponse({ status: 200, type: DeleteResponseDto })
  @ApiResponse({ status: 404, description: 'Produit introuvable' })
  @ApiResponse({ status: 409, description: 'Produit utilise dans des commandes' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}