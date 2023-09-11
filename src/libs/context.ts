import { PrismaClient } from '@prisma/client';
import { IncomingMessage, ServerResponse } from 'http';

declare let global: { prisma?: PrismaClient };

export type Context = {
  prisma: PrismaClient;
  user?: { name: string; id: string; roles: string[] };
  req: IncomingMessage;
  res: ServerResponse;
};

global.prisma?.$disconnect();

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: [
      {
        emit: 'stdout',
        level: 'query',
      },
    ],
  });

global.prisma = prisma;
