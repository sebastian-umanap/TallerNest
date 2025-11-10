/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { ArtworkEntity } from './artwork.entity';

@Injectable()
export class ArtworkService {
  constructor(
    @InjectRepository(ArtworkEntity)
    private readonly artworkRepository: Repository<ArtworkEntity>,
  ) {}

  async findAll(): Promise<ArtworkEntity[]> {
  return this.artworkRepository.find({ relations: ['images'] });
}

  async findOne(id: string): Promise<ArtworkEntity> {
    const artwork = await this.artworkRepository.findOne({
      where: { id },
      relations: ['images'],
    });
    if (!artwork)
      throw new BusinessLogicException('The artwork with the given id was not found', BusinessError.NOT_FOUND);
    return artwork;
  }

  async create(artwork: ArtworkEntity): Promise<ArtworkEntity> {
    return this.artworkRepository.save(artwork);
  }

  async update(id: string, artwork: ArtworkEntity): Promise<ArtworkEntity> {
    const persisted = await this.artworkRepository.findOne({ where: { id } });
    if (!persisted)
      throw new BusinessLogicException('The artwork with the given id was not found', BusinessError.NOT_FOUND);

    artwork.id = id;
    return this.artworkRepository.save(artwork);
  }

  async delete(id: string): Promise<void> {
    const artwork = await this.artworkRepository.findOne({ where: { id } });
    if (!artwork)
      throw new BusinessLogicException('The artwork with the given id was not found', BusinessError.NOT_FOUND);

    await this.artworkRepository.remove(artwork);
  }
}
