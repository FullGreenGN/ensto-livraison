import { Prisma, Entreprise } from '../../generated/prisma/client';
import { IBaseRepository } from '../interfaces/IRepository';
import { PrismaService } from '../prisma.service';
import { RecordNotFoundError, UniqueConstraintViolationError, DatabaseError } from '../errors';

export class EntrepriseRepository implements IBaseRepository<Entreprise, Prisma.EntrepriseCreateInput, Prisma.EntrepriseUpdateInput> {
  private prisma: PrismaService['client'];

  constructor(prismaService: PrismaService) {
    this.prisma = prismaService.client;
  }

  async create(data: Prisma.EntrepriseCreateInput): Promise<Entreprise> {
    try {
      return await this.prisma.entreprise.create({ data });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new UniqueConstraintViolationError('Unknown field'); // Detailed handling if needed
      }
      throw new DatabaseError('Failed to create Entreprise', error);
    }
  }

  async findAll(): Promise<Entreprise[]> {
    try {
      return await this.prisma.entreprise.findMany();
    } catch (error) {
      throw new DatabaseError('Failed to fetch Entreprises', error);
    }
  }

  async findById(id: number): Promise<Entreprise | null> {
    try {
      return await this.prisma.entreprise.findUnique({ where: { id: Number(id) } });
    } catch (error) {
      throw new DatabaseError(`Failed to fetch Entreprise with ID ${id}`, error);
    }
  }

  async update(id: number, data: Prisma.EntrepriseUpdateInput): Promise<Entreprise> {
    try {
      return await this.prisma.entreprise.update({
        where: { id: Number(id) },
        data,
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new RecordNotFoundError('Entreprise', id);
      }
      throw new DatabaseError(`Failed to update Entreprise with ID ${id}`, error);
    }
  }

  async delete(id: number): Promise<Entreprise> {
    try {
      return await this.prisma.entreprise.delete({ where: { id: Number(id) } });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new RecordNotFoundError('Entreprise', id);
      }
      throw new DatabaseError(`Failed to delete Entreprise with ID ${id}`, error);
    }
  }
}

