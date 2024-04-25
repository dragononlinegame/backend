import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { DatabaseService } from '../database/database.service';
import { Charset, generate } from 'referral-codes';

@Injectable()
export class FranchiseService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(phone: string, password: string, credits: number) {
    try {
      const id = generate({
        pattern: '######',
        charset: '1234567890',
        prefix: '',
        postfix: '',
      })[0];

      const code = generate({
        pattern: '####',
        charset: Charset.ALPHANUMERIC,
        prefix: '',
        postfix: '',
      })[0];

      const franchise = await this.databaseService.franchise.create({
        data: {
          phone,
          password,
          balance: credits,

          franchiseId: id,
          franchiseCode: code,
        },
      });

      return { success: true, data: franchise };
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        const constraint = e.meta.target; // Extract the constraint name

        if (constraint[0] === 'franchiseCode') {
          throw new HttpException(
            'Franchise Code is already in use.',
            HttpStatus.CONFLICT,
          );
        } else if (constraint[0] === 'franchiseId') {
          throw new HttpException(
            'Franchise ID is already in use.',
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

  async findAll(
    limit: string,
    skip: string,
    filterBy: undefined | string,
    filterValue: undefined | string,
  ) {
    const franchises = await this.databaseService.franchise.findMany({
      where: {
        id: filterBy === 'id' ? parseInt(filterValue) : undefined,
        franchiseCode: filterBy === 'code' ? filterValue : undefined,
        role: 'Franchise',
      },
      take: parseInt(limit),
      skip: parseInt(skip),
      select: {
        id: true,
        phone: true,
        email: true,
        franchiseId: true,
        franchiseCode: true,
        balance: true,
        createdAt: true,
      },
    });

    const total = await this.databaseService.franchise.count({
      where: {
        role: 'Franchise',
      },
    });

    return {
      success: true,
      data: {
        franchises,
        total,
      },
    };
  }

  async findOneById(id: number) {
    const franchise = await this.databaseService.franchise.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        franchiseId: true,
        franchiseCode: true,
        balance: true,
        role: true,
        createdAt: true,
      },
    });

    if (!franchise)
      throw new NotFoundException(`Can not find franchise with id ${id}`);

    return { success: true, data: franchise };
  }

  async update(id: number, updateUserInput: Prisma.userUpdateInput) {
    console.log(id);
    try {
      const updatedUser = await this.databaseService.franchise.update({
        where: {
          id,
        },
        data: updateUserInput,
        select: {
          id: true,
          franchiseId: true,
          franchiseCode: true,
          balance: true,
          role: true,
          createdAt: true,
        },
      });

      return { success: true, data: updatedUser };
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        const constraint = e.meta.target; // Extract the constraint name

        if (constraint[0] === 'username') {
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

  async updateBalance(id: number, type: string, amount: number) {
    try {
      const updatedUser = await this.databaseService.franchise.update({
        where: {
          id,
        },
        data: {
          balance: {
            increment: type === 'Credit' ? amount : amount * -1,
          },
        },
        select: {
          id: true,
          franchiseId: true,
          franchiseCode: true,
          balance: true,
          role: true,
          createdAt: true,
        },
      });

      return { success: true, data: updatedUser };
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        const constraint = e.meta.target; // Extract the constraint name

        if (constraint[0] === 'username') {
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

  async remove(id: number) {
    await this.databaseService.franchise.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      data: `Deleted a franchise with Franchise ID #${id}`,
    };
  }
}
