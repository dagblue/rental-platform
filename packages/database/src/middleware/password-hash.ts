import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

export const hashPasswordMiddleware: Prisma.Middleware = async (params, next) => {
  if (params.model === 'User') {
    // Handle CREATE operations
    if (params.action === 'create') {
      if (params.args.data.passwordHash) {
        params.args.data.passwordHash = await bcrypt.hash(
          params.args.data.passwordHash,
          10
        );
      }
    }

    // Handle UPDATE operations
    if (params.action === 'update') {
      if (params.args.data.passwordHash) {
        params.args.data.passwordHash = await bcrypt.hash(
          params.args.data.passwordHash,
          10
        );
      }
    }

    // Handle UPSERT operations
    if (params.action === 'upsert') {
      if (params.args.create?.passwordHash) {
        params.args.create.passwordHash = await bcrypt.hash(
          params.args.create.passwordHash,
          10
        );
      }
      if (params.args.update?.passwordHash) {
        params.args.update.passwordHash = await bcrypt.hash(
          params.args.update.passwordHash,
          10
        );
      }
    }
  }

  return next(params);
};
