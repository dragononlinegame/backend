import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateBetDto } from './dto/create-bet.dto';
import { DatabaseService } from '../database/database.service';
import { BetEvent } from './events/betEvent';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class BetsService {
  readonly validPredictions = [
    'small',
    'big',
    'red',
    'green',
    'violet',
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
  ];

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly databaseService: DatabaseService,
  ) {}

  async create(userid: number, createBetDto: CreateBetDto) {
    const game = await this.databaseService.game.findFirst({
      where: {
        id: createBetDto.gameID,
      },
      select: {
        id: true,
        ended_at: true,
      },
    });

    if (!game) {
      throw new HttpException('Invalid Game', HttpStatus.BAD_REQUEST);
    }

    const playtime = new Date(game.ended_at);
    if (playtime <= new Date()) {
      throw new HttpException(
        'Play time has already ended',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (createBetDto.amount < 1) {
      throw new HttpException('Invalid Bet Amount', HttpStatus.BAD_REQUEST);
    }

    if (
      this.validPredictions.findIndex(
        (value) => value === createBetDto.prediction,
      ) === -1
    ) {
      throw new HttpException('Invalid Prediction', HttpStatus.BAD_REQUEST);
    }

    await this.databaseService.$transaction(async (txn) => {
      const wallet = await txn.wallet.update({
        where: {
          userId: userid,
        },
        data: {
          balance: {
            decrement: createBetDto.amount,
          },
          transactions: {
            create: {
              amount: createBetDto.amount,
              type: 'Debit',
              description: 'Bet',
            },
          },
        },
      });

      if (Number(wallet.balance) < 0)
        throw new HttpException('Insufficient Balance', HttpStatus.BAD_REQUEST);

      const ServiceTexAmount =
        createBetDto.amount * parseFloat(process.env.SERVICE_TEX);

      await txn.bet.create({
        data: {
          userId: userid,
          gameId: createBetDto.gameID,
          prediction: createBetDto.prediction,
          amount: createBetDto.amount - ServiceTexAmount,
        },
      });
    });

    // generate commissions asynchronusly
    const betCreateEvent = new BetEvent();
    betCreateEvent.userId = userid;
    betCreateEvent.betAmount = createBetDto.amount;
    this.eventEmitter.emit('bet.created', betCreateEvent);

    return {
      success: true,
      data: 'Bet confirmed',
    };
  }

  async findAll(type: string, limit: string, skip: string) {
    const parsedType = type ? parseInt(type) : undefined;

    const bets = await this.databaseService.bet.findMany({
      where: {
        game: {
          type: parsedType,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        game: {
          select: {
            serial: true,
            result: true,
            started_at: true,
            ended_at: true,
          },
        },
        win: {
          select: {
            id: true,
            winAmount: true,
            isClaimed: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: parseInt(limit),
      skip: parseInt(skip),
    });

    const total = await this.databaseService.bet.count({
      where: {
        game: {
          type: parsedType,
        },
      },
    });

    return {
      success: true,
      data: {
        bets,
        total,
      },
    };
  }

  async findByUserId(
    userid: number,
    type: string,
    limit: string,
    skip: string,
  ) {
    const parsedType = type ? parseInt(type) : undefined;

    const bets = await this.databaseService.bet.findMany({
      where: {
        userId: userid,
        game: {
          type: parsedType,
        },
      },
      include: {
        game: {
          select: {
            serial: true,
            result: true,
            started_at: true,
            ended_at: true,
          },
        },
        win: {
          select: {
            id: true,
            winAmount: true,
            isClaimed: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: parseInt(limit),
      skip: parseInt(skip),
    });

    const total = await this.databaseService.bet.count({
      where: {
        game: {
          type: parsedType,
        },
      },
    });

    return { success: true, data: { bets, total } };
  }

  async findOne(id: number) {
    const bet = await this.databaseService.bet.findFirst({
      where: {
        id,
      },
      include: {
        game: {
          select: {
            result: true,
            started_at: true,
            ended_at: true,
          },
        },
        win: {
          select: {
            id: true,
            winAmount: true,
            isClaimed: true,
          },
        },
      },
    });

    return { success: true, data: bet };
  }

  async update(id: number, updateBetIput: Prisma.betUpdateInput) {
    const user = await this.databaseService.bet.update({
      where: {
        id,
      },
      data: updateBetIput,
    });

    return { success: true, data: user };
  }

  async remove(id: number) {
    await this.databaseService.bet.delete({
      where: {
        id,
      },
    });

    return { success: true, data: `Deleted a Bet with ID: #${id}` };
  }
}
