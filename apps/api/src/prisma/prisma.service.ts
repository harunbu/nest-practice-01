import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';
import { resolve } from 'node:path';

function resolveDatabaseUrl(): string {
  const configuredUrl = process.env.DATABASE_URL ?? 'file:./prisma/dev.db';

  if (!configuredUrl.startsWith('file:')) {
    return configuredUrl;
  }

  const workspaceDir = process.cwd().endsWith('/apps/api')
    ? process.cwd()
    : resolve(process.cwd(), 'apps/api');
  const relativePath = configuredUrl.slice('file:'.length);

  return `file:${resolve(workspaceDir, relativePath)}`;
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      adapter: new PrismaBetterSqlite3({
        url: resolveDatabaseUrl(),
      }),
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
