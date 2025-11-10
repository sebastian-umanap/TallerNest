/* archivo: src/museum-artwork/museum-artwork.service.ts */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { MuseumEntity } from '../museum/museum.entity';
import { ArtworkEntity } from '../artwork/artwork.entity';

@Injectable()
export class MuseumArtworkService {
  constructor(
    @InjectRepository(MuseumEntity)
    private readonly museumRepository: Repository<MuseumEntity>,
    @InjectRepository(ArtworkEntity)
    private readonly artworkRepository: Repository<ArtworkEntity>,
  ) {}

  async addArtworkMuseum(museumId: string, artworkId: string): Promise<MuseumEntity> {
    const artwork = await this.artworkRepository.findOne({ where: { id: artworkId } });
    if (!artwork)
      throw new BusinessLogicException('The artwork with the given id was not found', BusinessError.NOT_FOUND);

    const museum = await this.museumRepository.findOne({
      where: { id: museumId },
      relations: ['artworks', 'exhibitions'],
    });
    if (!museum)
      throw new BusinessLogicException('The museum with the given id was not found', BusinessError.NOT_FOUND);

    museum.artworks = [...museum.artworks, artwork];
    return this.museumRepository.save(museum);
  }

  async findArtworkByMuseumIdArtworkId(museumId: string, artworkId: string): Promise<ArtworkEntity> {
    const artwork = await this.artworkRepository.findOne({ where: { id: artworkId } });
    if (!artwork)
      throw new BusinessLogicException('The artwork with the given id was not found', BusinessError.NOT_FOUND);

    const museum = await this.museumRepository.findOne({
      where: { id: museumId },
      relations: ['artworks'],
    });
    if (!museum)
      throw new BusinessLogicException('The museum with the given id was not found', BusinessError.NOT_FOUND);

    const museumArtwork = museum.artworks.find(e => e.id === artwork.id);
    if (!museumArtwork)
      throw new BusinessLogicException(
        'The artwork with the given id is not associated to the museum',
        BusinessError.PRECONDITION_FAILED,
      );

    return museumArtwork;
  }

  async findArtworksByMuseumId(museumId: string): Promise<ArtworkEntity[]> {
    const museum = await this.museumRepository.findOne({
      where: { id: museumId },
      relations: ['artworks'],
    });
    if (!museum)
      throw new BusinessLogicException('The museum with the given id was not found', BusinessError.NOT_FOUND);

    return museum.artworks;
  }

  async associateArtworksMuseum(museumId: string, artworks: ArtworkEntity[]): Promise<MuseumEntity> {
    const museum = await this.museumRepository.findOne({
      where: { id: museumId },
      relations: ['artworks'],
    });
    if (!museum)
      throw new BusinessLogicException('The museum with the given id was not found', BusinessError.NOT_FOUND);

    const attached: ArtworkEntity[] = [];
    for (const a of artworks) {
      const found = await this.artworkRepository.findOne({ where: { id: a.id } });
      if (!found)
        throw new BusinessLogicException('The artwork with the given id was not found', BusinessError.NOT_FOUND);
      attached.push(found);
    }
    museum.artworks = attached;
    return this.museumRepository.save(museum);
  }

  async deleteArtworkMuseum(museumId: string, artworkId: string): Promise<void> {
    const artwork = await this.artworkRepository.findOne({ where: { id: artworkId } });
    if (!artwork)
      throw new BusinessLogicException('The artwork with the given id was not found', BusinessError.NOT_FOUND);

    const museum = await this.museumRepository.findOne({
      where: { id: museumId },
      relations: ['artworks'],
    });
    if (!museum)
      throw new BusinessLogicException('The museum with the given id was not found', BusinessError.NOT_FOUND);

    const museumArtwork = museum.artworks.find(e => e.id === artwork.id);
    if (!museumArtwork)
      throw new BusinessLogicException(
        'The artwork with the given id is not associated to the museum',
        BusinessError.PRECONDITION_FAILED,
      );

    museum.artworks = museum.artworks.filter(e => e.id !== artworkId);
    await this.museumRepository.save(museum);
  }
}
