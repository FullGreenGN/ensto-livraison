import { Personnel, Prisma } from '../../generated/prisma/client';
import { IBaseRepository } from './IRepository';

/**
 * Auth-specific queries on top of the base CRUD contract.
 */
export interface IPersonnelRepository
  extends IBaseRepository<Personnel, Prisma.PersonnelCreateInput, Prisma.PersonnelUpdateInput> {
  /** Look up a Personnel by its unique login handle. */
  findByIdentifiant(identifiant: string): Promise<Personnel | null>;
}

