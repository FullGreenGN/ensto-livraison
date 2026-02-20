import { PrismaClient } from '../generated/prisma/client';
import { prisma } from './client';

export class PrismaService {
  private static instance: PrismaService;
  private _client: PrismaClient;

  private constructor() {
    this._client = prisma;
  }

  public static getInstance(): PrismaService {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaService();
    }
    return PrismaService.instance;
  }

  public get client(): PrismaClient {
    return this._client;
  }

  async connect(): Promise<void> {
    await this._client.$connect();
  }

  async disconnect(): Promise<void> {
    await this._client.$disconnect();
  }
}

