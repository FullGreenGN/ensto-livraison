import { Prisma, Personnel } from '../../generated/prisma/client';
import { PrismaService } from '../prisma.service';
import { IPersonnelRepository } from '../interfaces/IPersonnelRepository';
import {
  RecordNotFoundError,
  UniqueConstraintViolationError,
  DatabaseError,
} from '../errors';

export class PersonnelRepository implements IPersonnelRepository {
  private prisma: PrismaService['client'];

  constructor(prismaService: PrismaService) {
    this.prisma = prismaService.client;
  }

  // ── IBaseRepository ────────────────────────────────────────────────────────

  async create(data: Prisma.PersonnelCreateInput): Promise<Personnel> {
    try {
      return await this.prisma.personnel.create({ data });
    } catch (error: any) {
      if (error.code === 'P2002') {
        const field = error.meta?.target ?? 'Unknown field';
        throw new UniqueConstraintViolationError(String(field));
      }
      throw new DatabaseError('Failed to create Personnel', error);
    }
  }

  async findAll(): Promise<Personnel[]> {
    try {
      return await this.prisma.personnel.findMany();
    } catch (error) {
      throw new DatabaseError('Failed to fetch Personnel list', error);
    }
  }

  async findById(id: number): Promise<Personnel | null> {
    try {
      return await this.prisma.personnel.findUnique({ where: { id: Number(id) } });
    } catch (error) {
      throw new DatabaseError(`Failed to fetch Personnel with ID ${id}`, error);
    }
  }

  async update(id: number, data: Prisma.PersonnelUpdateInput): Promise<Personnel> {
    try {
      return await this.prisma.personnel.update({
        where: { id: Number(id) },
        data,
      });
    } catch (error: any) {
      if (error.code === 'P2025') throw new RecordNotFoundError('Personnel', id);
      throw new DatabaseError(`Failed to update Personnel with ID ${id}`, error);
    }
  }

  async delete(id: number): Promise<Personnel> {
    try {
      return await this.prisma.personnel.delete({ where: { id: Number(id) } });
    } catch (error: any) {
      if (error.code === 'P2025') throw new RecordNotFoundError('Personnel', id);
      throw new DatabaseError(`Failed to delete Personnel with ID ${id}`, error);
    }
  }

  // ── IPersonnelRepository ───────────────────────────────────────────────────

  async findByIdentifiant(identifiant: string): Promise<Personnel | null> {
    try {
      return await this.prisma.personnel.findUnique({ where: { identifiant } });
    } catch (error) {
      throw new DatabaseError(
        `Failed to fetch Personnel with identifiant "${identifiant}"`,
        error,
      );
    }
  }
}

