import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from 'lib/prisma';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ResultAnnouncedEvent } from './events/resultAnnouncedEvent';
import { Numbers } from 'src/constants/numbers';

@Injectable()
export class GamesService {
  constructor(private eventEmitter: EventEmitter2) {}

  private readonly durations = {
    0: 1,
    1: 5,
    3: 10,
  };

  private readonly numbers = Numbers;

  async findWinningNumber(game_id: number) {
    const defaultMultiplier = parseFloat(
      process.env.DEFAULT_MULTIPLIER as string,
    );
    const numberMultiplier = parseFloat(
      process.env.NUMBER_MULTIPLIER as string,
    );

    const betsOnNumbers = {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
    };

    const betsOnSizeNColors = {
      small: 0,
      big: 0,
      red: 0,
      green: 0,
      violet: 0,
    };

    const betAmountSum_groupBy_prediction = await prisma.bet.groupBy({
      by: ['prediction'],
      where: {
        gameId: game_id,
      },
      _sum: {
        amount: true,
      },
    });

    for (const betGroup of betAmountSum_groupBy_prediction) {
      if (isNaN(parseInt(betGroup.prediction))) {
        betsOnSizeNColors[betGroup.prediction] = betGroup._sum.amount;
      } else {
        betsOnNumbers[betGroup.prediction] = betGroup._sum.amount;
      }
    }

    const betsOnNumberByColorNSize = {
      0:
        Number(betsOnSizeNColors[this.numbers[0].size]) +
        Number(betsOnSizeNColors[this.numbers[0].color[0]]) +
        Number(betsOnSizeNColors[this.numbers[0].color[1]]),
      1:
        Number(betsOnSizeNColors[this.numbers[1].size]) +
        Number(betsOnSizeNColors[this.numbers[1].color[0]]),
      2:
        Number(betsOnSizeNColors[this.numbers[2].size]) +
        Number(betsOnSizeNColors[this.numbers[2].color[0]]),
      3:
        Number(betsOnSizeNColors[this.numbers[3].size]) +
        Number(betsOnSizeNColors[this.numbers[3].color[0]]),
      4:
        Number(betsOnSizeNColors[this.numbers[4].size]) +
        Number(betsOnSizeNColors[this.numbers[4].color[0]]),
      5:
        Number(betsOnSizeNColors[this.numbers[5].size]) +
        Number(betsOnSizeNColors[this.numbers[5].color[0]]) +
        Number(betsOnSizeNColors[this.numbers[5].color[1]]),
      6:
        Number(betsOnSizeNColors[this.numbers[6].size]) +
        Number(betsOnSizeNColors[this.numbers[6].color[0]]),
      7:
        Number(betsOnSizeNColors[this.numbers[7].size]) +
        Number(betsOnSizeNColors[this.numbers[7].color[0]]),
      8:
        Number(betsOnSizeNColors[this.numbers[8].size]) +
        Number(betsOnSizeNColors[this.numbers[8].color[0]]),
      9:
        Number(betsOnSizeNColors[this.numbers[9].size]) +
        Number(betsOnSizeNColors[this.numbers[9].color[0]]),
    };

    const winningAmountOnNumbers = {
      0:
        betsOnNumbers[0] * numberMultiplier +
        betsOnNumberByColorNSize[0] * defaultMultiplier,
      1:
        betsOnNumbers[1] * numberMultiplier +
        betsOnNumberByColorNSize[1] * defaultMultiplier,
      2:
        betsOnNumbers[2] * numberMultiplier +
        betsOnNumberByColorNSize[2] * defaultMultiplier,
      3:
        betsOnNumbers[3] * numberMultiplier +
        betsOnNumberByColorNSize[3] * defaultMultiplier,
      4:
        betsOnNumbers[4] * numberMultiplier +
        betsOnNumberByColorNSize[4] * defaultMultiplier,
      5:
        betsOnNumbers[5] * numberMultiplier +
        betsOnNumberByColorNSize[5] * defaultMultiplier,
      6:
        betsOnNumbers[6] * numberMultiplier +
        betsOnNumberByColorNSize[6] * defaultMultiplier,
      7:
        betsOnNumbers[7] * numberMultiplier +
        betsOnNumberByColorNSize[7] * defaultMultiplier,
      8:
        betsOnNumbers[8] * numberMultiplier +
        betsOnNumberByColorNSize[8] * defaultMultiplier,
      9:
        betsOnNumbers[9] * numberMultiplier +
        betsOnNumberByColorNSize[9] * defaultMultiplier,
    };

    let lowestBetAmount = Infinity;

    for (const [prediction, betAmount] of Object.entries(
      winningAmountOnNumbers,
    )) {
      if (!isNaN(parseInt(prediction))) {
        if (Number(betAmount) < lowestBetAmount) {
          lowestBetAmount = Number(betAmount);
        }
      }
    }

    const possibleWinningNumbes: number[] = [];

    Object.entries(winningAmountOnNumbers).forEach(
      ([prediction, betAmount]) => {
        if (Number(betAmount) === lowestBetAmount) {
          possibleWinningNumbes.push(Number(prediction));
        }
      },
    );

    return possibleWinningNumbes[
      Math.floor(Math.random() * possibleWinningNumbes.length)
    ];
  }

  async create(createGameDto: CreateGameDto) {
    const gameDuration = this.durations[createGameDto.type];
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + gameDuration * 60 * 1000);

    try {
      const new_game = await prisma.game.create({
        data: {
          type: createGameDto.type,
          serial: createGameDto.serial,
          started_at: startTime,
          ended_at: endTime,
        },
      });

      return { success: true, data: new_game };
    } catch (error) {
      console.log(error);
      throw new Error('Error Creating Game.');
    }
  }

  async findAll(type: string, limit: string, skip: string) {
    const games = await prisma.game.findMany({
      where: {
        type: parseInt(type),
        NOT: [
          {
            result: null,
          },
        ],
      },
      orderBy: {
        started_at: 'desc',
      },
      select: {
        id: true,
        serial: true,
        type: true,
        started_at: true,
        ended_at: true,
        result: true,
      },
      take: parseInt(limit),
      skip: parseInt(skip),
    });

    const total = await prisma.game.count({
      where: {
        type: parseInt(type),
        NOT: [
          {
            result: null,
          },
        ],
      },
    });

    return {
      success: true,
      data: {
        games,
        total,
      },
    };
  }

  async findOne(id: number) {
    const game = await prisma.game.findFirst({
      where: {
        id: id,
      },
      select: {
        id: true,
        serial: true,
        type: true,
        started_at: true,
        ended_at: true,
      },
    });

    if (!game) throw new NotFoundException(`Game with gameId ${id} not found!`);

    return { success: true, data: game };
  }

  async findCurrent(type: string) {
    const game = await prisma.game.findFirst({
      where: {
        type: parseInt(type),
        result: null,
      },
      orderBy: {
        started_at: 'desc',
      },
      select: {
        id: true,
        serial: true,
        type: true,
        started_at: true,
        ended_at: true,
      },
    });

    if (!game) throw new NotFoundException('Can not find New Issued Game.');

    return { success: true, data: game };
  }

  async update(id: number, updateGameDto: UpdateGameDto) {
    const game = await prisma.game.update({
      where: {
        id: id,
      },
      data: {
        result: updateGameDto.result
          ? updateGameDto.result.toString()
          : undefined,
      },
    });

    return { success: true, data: game };
  }

  async remove(id: number) {
    await prisma.game.delete({
      where: {
        id: id,
      },
    });

    return { success: true, data: `Deleted Game with GameID : #${id}` };
  }

  async issueNewGame(type: number = 0) {
    const last_game = await prisma.game.findFirst({
      where: {
        type: type,
        result: null,
      },
      orderBy: {
        started_at: 'asc',
      },
      select: {
        id: true,
        serial: true,
        started_at: true,
        ended_at: true,
      },
    });

    if (last_game) {
      const winning_number = await this.findWinningNumber(last_game.id);

      // Draw Result of prv game.
      this.update(last_game.id, { result: winning_number.toString() });

      // Process Winnings asynchronusly
      const resultAnnouncedEvent = new ResultAnnouncedEvent();
      resultAnnouncedEvent.gameId = last_game.id;
      resultAnnouncedEvent.result = winning_number.toString();
      this.eventEmitter.emit('result.announced', resultAnnouncedEvent);

      // Issue New Game
      const new_game = await this.create({
        type: type,
        serial: last_game.serial + 1,
      });

      return new_game;
    } else {
      const last_game = await prisma.game.findFirst({
        where: {
          type: type,
        },
        orderBy: {
          started_at: 'desc',
        },
        select: {
          id: true,
          serial: true,
          started_at: true,
          ended_at: true,
        },
      });

      if (last_game) {
        // Issue New Game
        const new_game = await this.create({
          type: type,
          serial: last_game.serial + 1,
        });

        return new_game;
      } else {
        // Issue New Game
        const new_game = await this.create({
          type: type,
          serial: 1,
        });

        return new_game;
      }
    }
  }
}
