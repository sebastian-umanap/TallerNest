/* eslint-disable prettier/prettier */
// src/museum/museum.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { MuseumEntity } from './museum.entity';

type MuseumQuery = {
  city?: string;
  name?: string;
  foundedBefore?: number;
  page?: number;
  limit?: number;
};

@Injectable()
export class MuseumService {
  constructor(
    @InjectRepository(MuseumEntity)
    private readonly museumRepository: Repository<MuseumEntity>,
  ) {}

  async findAll(q: MuseumQuery = {}): Promise<MuseumEntity[]> {
    const { city, name, foundedBefore } = q;
    const page = Math.max(q.page ?? 1, 1);
    const limit = Math.min(Math.max(q.limit ?? 10, 1), 100);

    const qb = this.museumRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.artworks', 'artworks')
      .leftJoinAndSelect('m.exhibitions', 'exhibitions');

    if (city) qb.andWhere('LOWER(m.city) LIKE :city', { city: `%${city.toLowerCase()}%` });
    if (name) qb.andWhere('LOWER(m.name) LIKE :name', { name: `%${name.toLowerCase()}%` });
    if (typeof foundedBefore === 'number') {
      qb.andWhere('m.foundedBefore < :foundedBefore', { foundedBefore });
    }

    qb.skip((page - 1) * limit).take(limit);
    return qb.getMany();
  }

  async findOne(id: string): Promise<MuseumEntity> {
    const museum = await this.museumRepository.findOne({
      where: { id },
      relations: ['artworks', 'exhibitions'],
    });
    if (!museum)
      throw new BusinessLogicException('The museum with the given id was not found', BusinessError.NOT_FOUND);

    return museum;
  }

  async create(museum: MuseumEntity): Promise<MuseumEntity> {
    return this.museumRepository.save(museum);
  }

  async update(id: string, museum: MuseumEntity): Promise<MuseumEntity> {
    const persisted = await this.museumRepository.findOne({ where: { id } });
    if (!persisted)
      throw new BusinessLogicException('The museum with the given id was not found', BusinessError.NOT_FOUND);

    return this.museumRepository.save({ ...persisted, ...museum, id });
  }

  async delete(id: string): Promise<void> {
    const museum = await this.museumRepository.findOne({ where: { id } });
    if (!museum)
      throw new BusinessLogicException('The museum with the given id was not found', BusinessError.NOT_FOUND);

    await this.museumRepository.remove(museum);
  }
}
