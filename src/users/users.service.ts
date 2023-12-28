import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createUserInput: Prisma.userCreateInput) {
    try {
      const user = await this.databaseService.user.create({
        data: {
          ...createUserInput,
          wallet: {
            create: {
              balance: 0,
            },
          },
        },
      });

      return { success: true, data: user };
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        const constraint = e.meta.target; // Extract the constraint name

        if (constraint[0] === 'email') {
          throw new HttpException(
            'Email is already taken',
            HttpStatus.CONFLICT,
          );
        } else if (constraint[0] === 'username') {
          throw new HttpException(
            'Username is already taken',
            HttpStatus.CONFLICT,
          );
        }
      }

      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(limit: string, skip: string) {
    const users = await this.databaseService.user.findMany({
      where: {
        role: 'User',
      },
      take: parseInt(limit),
      skip: parseInt(skip),
      select: {
        id: true,
        email: true,
        username: true,
        referralCode: true,
        role: true,
        status: true,
        isBanned: true,
        createdAt: true,
      },
    });

    const total = await this.databaseService.user.count();

    return {
      success: true,
      data: {
        users,
        total,
      },
    };
  }

  async findOneById(id: number) {
    const user = await this.databaseService.user.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        username: true,
        referralCode: true,
        role: true,
        status: true,
        isBanned: true,
        createdAt: true,
      },
    });

    if (!user)
      throw new NotFoundException(`Can not find user with UserID ${id}`);

    return { success: true, data: user };
  }

  async findOneByEmail(email: string) {
    const user = await this.databaseService.user.findFirst({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        referralCode: true,
        role: true,
        status: true,
        isBanned: true,
        createdAt: true,
      },
    });

    if (!user)
      throw new NotFoundException(`Can not find user with email ${email}`);

    return { success: true, data: user };
  }

  async update(id: number, updateUserInput: Prisma.userUpdateInput) {
    const updatedUser = await this.databaseService.user.update({
      where: {
        id,
      },
      data: updateUserInput,
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        status: true,
        isBanned: true,
        createdAt: true,
      },
    });

    return { success: true, data: updatedUser };
  }

  async remove(id: number) {
    await this.databaseService.user.delete({
      where: {
        id,
      },
    });

    return { success: true, data: `Deleted a user with UserID #${id}` };
  }
}
