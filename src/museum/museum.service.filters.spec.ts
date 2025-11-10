/* archivo: src/museum/museum.service.filters.spec.ts */
/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { MuseumService } from './museum.service';
import { Repository } from 'typeorm';
import { MuseumEntity } from './museum.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('MuseumService – filtros y paginación', () => {
  let service: MuseumService;
  let repo: Repository<MuseumEntity>;

  const seed = async () => {
    await repo.clear();

    const items: Partial<MuseumEntity>[] = [];
    for (let i = 0; i < 25; i++) {
      items.push({
        name: i % 2 === 0 ? `Museo del Oro ${i}` : `Arte Moderno ${i}`,
        description: `Desc ${i}`,
        address: `Calle ${i} # ${i}-0`,
        city: i % 3 === 0 ? 'Bogotá' : i % 3 === 1 ? 'Medellín' : 'Cali',
        image: `https://picsum.photos/seed/m${i}/800/500`,
        foundedBefore: 1800 + i, // 1800..1824
      });
    }
    await repo.save(items);
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [MuseumService],
    }).compile();

    service = module.get(MuseumService);
    repo = module.get<Repository<MuseumEntity>>(getRepositoryToken(MuseumEntity));
    await seed();
  });

  it('devuelve máx 10 por defecto (page=1, limit=10)', async () => {
    const res = await service.findAll({});
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBeLessThanOrEqual(10);
  });

  it('filtra por name (contains, case-insensitive)', async () => {
    const res = await service.findAll({ name: 'oro', limit: 50 });
    expect(res.length).toBeGreaterThan(0);
    expect(res.every(m => m.name.toLowerCase().includes('oro'))).toBe(true);
  });

  it('combina city + foundedBefore', async () => {
    const res = await service.findAll({ city: 'bogo', foundedBefore: 1805, limit: 50 });
    expect(res.every(m => (m.city ?? '').toLowerCase().includes('bogo'))).toBe(true);
    expect(res.every(m => (m.foundedBefore ?? 9999) < 1805)).toBe(true);
  });

  it('pagina con page y limit y no repite elementos entre páginas', async () => {
    const page1 = await service.findAll({ page: 1, limit: 5 });
    const page2 = await service.findAll({ page: 2, limit: 5 });

    expect(page1.length).toBe(5);
    expect(page2.length).toBe(5);

    const set1 = new Set(page1.map(x => x.id));
    const overlap = page2.some(x => set1.has(x.id));
    expect(overlap).toBe(false); // requiere orden estable por defecto; ideal tener orderBy('m.id','ASC')
  });

  it('con filtros que no matchean, devuelve []', async () => {
    const res = await service.findAll({ name: 'no-existe-123', city: 'zz', foundedBefore: 1000 });
    expect(res.length).toBe(0);
  });
});
