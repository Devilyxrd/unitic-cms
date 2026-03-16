import { Role } from '@prisma/client';
import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../constants/auth';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
