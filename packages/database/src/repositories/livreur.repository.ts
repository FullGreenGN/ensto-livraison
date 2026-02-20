import { Prisma, Livreur } from '../../generated/prisma/client';
import { IBaseRepository } from '../interfaces/IRepository';
import { PrismaService } from '../prisma.service';
import { RecordNotFoundError, UniqueConstraintViolationError, DatabaseError } from '../errors';

export class LivreurRepository implements IBaseRepository<Livreur, Prisma.LivreurCreateInput, Prisma.LivreurUpdateInput> {
  private prisma: PrismaService['client'];

  constructor(prismaService: PrismaService) {
    this.prisma = prismaService.client;
  }

  async create(data: Prisma.LivreurCreateInput): Promise<Livreur> {
    try {
      return await this.prisma.livreur.create({ data });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new UniqueConstraintViolationError('Unknown field');
      }
      throw new DatabaseError('Failed to create Livreur', error);
    }
  }

  async findAll(): Promise<Livreur[]> {
    try {
      return await this.prisma.livreur.findMany();
    } catch (error) {
      throw new DatabaseError('Failed to fetch Livreurs', error);
    }
  }

  async findById(id: number): Promise<Livreur | null> {
    try {
      return await this.prisma.livreur.findUnique({ where: { id: Number(id) } });
    } catch (error) {
      throw new DatabaseError(`Failed to fetch Livreur with ID ${id}`, error);
    }
  }

  async update(id: number, data: Prisma.LivreurUpdateInput): Promise<Livreur> {
    try {
      return await this.prisma.livreur.update({
        where: { id: Number(id) },
        data,
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new RecordNotFoundError('Livreur', id);
      }
      throw new DatabaseError(`Failed to update Livreur with ID ${id}`, error);
    }
  }

  async delete(id: number): Promise<Livreur> {
    try {
      return await this.prisma.livreur.delete({ where: { id: Number(id) } });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new RecordNotFoundError('Livreur', id);
      }
      throw new DatabaseError(`Failed to delete Livreur with ID ${id}`, error);
    }
  }

  async findByEntrepriseId(entrepriseId: number): Promise<Livreur[]> {
    try {
      return await this.prisma.livreur.findMany({
        where: { entrepriseId: Number(entrepriseId) },
      });
    } catch (error) {
      throw new DatabaseError(`Failed to fetch Livreurs for Entreprise ID ${entrepriseId}`, error);
    }
  }
}
