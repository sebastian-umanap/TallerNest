/* eslint-disable prettier/prettier */
// src/museum/museum.controller.ts
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, UseInterceptors } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { MuseumDto } from './museum.dto';
import { MuseumEntity } from './museum.entity';
import { MuseumService } from './museum.service';

@Controller('museums')
@UseInterceptors(BusinessErrorsInterceptor)
export class MuseumController {
  constructor(private readonly museumService: MuseumService) {}

  @Get()
  async findAll(
    @Query('city') city?: string,
    @Query('name') name?: string,
    @Query('foundedBefore') foundedBefore?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return await this.museumService.findAll({
      city,
      name,
      foundedBefore: foundedBefore !== undefined ? Number(foundedBefore) : undefined,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });
  }

  @Get(':museumId')
  async findOne(@Param('museumId') museumId: string) {
    return await this.museumService.findOne(museumId);
  }

  @Post()
  async create(@Body() museumDto: MuseumDto) {
    const museum: MuseumEntity = plainToInstance(MuseumEntity, museumDto);
    return await this.museumService.create(museum);
  }

  @Put(':museumId')
  async update(@Param('museumId') museumId: string, @Body() museumDto: MuseumDto) {
    const museum: MuseumEntity = plainToInstance(MuseumEntity, museumDto);
    return await this.museumService.update(museumId, museum);
  }

  @Delete(':museumId')
  @HttpCode(204)
  async delete(@Param('museumId') museumId: string) {
    return await this.museumService.delete(museumId);
  }
}
