import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from 'lib/prisma';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class UsersService {
  async create(createUserInput: Prisma.userCreateInput) {
    try {
      const user = await prisma.user.create({
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

        if (constraint === 'user_email_key') {
          throw new HttpException(
            'Email is already taken',
            HttpStatus.CONFLICT,
          );
        } else if (constraint === 'user_username_key') {
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
    const users = await prisma.user.findMany({
      take: parseInt(limit),
      skip: parseInt(skip),
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    const total = await prisma.user.count();

    return {
      success: true,
      data: {
        users,
        total,
      },
    };
  }

  async findOneById(id: number) {
    const user = await prisma.user.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user)
      throw new NotFoundException(`Can not find user with UserID ${id}`);

    return { success: true, data: user };
  }

  async findOneByEmail(email: string) {
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user)
      throw new NotFoundException(`Can not find user with email ${email}`);

    return { success: true, data: user };
  }

  async update(id: number, updateUserInput: Prisma.userUpdateInput) {
    const updatedUser = await prisma.user.update({
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
        createdAt: true,
      },
    });

    return { success: true, data: updatedUser };
  }

  async remove(id: number) {
    await prisma.user.delete({
      where: {
        id,
      },
    });

    return { success: true, data: `Deleted a user with UserID #${id}` };
  }

  async getWalletByUserId(id: number) {
    const wallet = await prisma.wallet.findFirst({
      where: {
        userId: id,
      },
      select: {
        id: true,
        balance: true,
      },
    });

    return { success: true, data: wallet };
  }
}
