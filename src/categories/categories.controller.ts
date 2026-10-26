import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { DeleteResponseDto } from '../common/dto/delete-response.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Post() @ApiOperation({ summary: 'Creer une categorie' })
  @ApiResponse({ status: 201, description: 'Categorie creee', type: CategoryResponseDto })
  @ApiResponse({ status: 400, description: 'Donnees invalides' })
  create(@Body() dto: CreateCategoryDto) { return this.service.create(dto); }

  @Get() @ApiOperation({ summary: 'Lister les categories et produits' })
  @ApiResponse({ status: 200, description: 'Liste des categories', type: [CategoryResponseDto] })
  findAll() { return this.service.findAll(); }

  @Get(':id') @ApiOperation({ summary: 'Detail d une categorie' })
  @ApiResponse({ status: 200, type: CategoryResponseDto })
  @ApiResponse({ status: 400, description: 'Identifiant invalide' })
  @ApiResponse({ status: 404, description: 'Categorie introuvable' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Patch(':id') @ApiOperation({ summary: 'Renommer une categorie' })
  @ApiResponse({ status: 200, type: CategoryResponseDto })
  @ApiResponse({ status: 400, description: 'Donnees invalides' })
  @ApiResponse({ status: 404, description: 'Categorie introuvable' })
  @ApiResponse({ status: 409, description: 'Nom deja utilise' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id') @ApiOperation({ summary: 'Supprimer une categorie (refuse si elle a des produits)' })
  @ApiResponse({ status: 200, type: DeleteResponseDto })
  @ApiResponse({ status: 404, description: 'Categorie introuvable' })
  @ApiResponse({ status: 409, description: 'Categorie contenant des produits' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}