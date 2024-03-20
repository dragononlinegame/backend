import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ResultAnnouncedEvent } from './events/resultAnnouncedEvent';
import { Numbers } from '../constants/numbers';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { cached_keys } from '../constants/cache-keys';
import { DatabaseService } from '../database/database.service';
import { format, isSameDay, parse } from 'date-fns';

@Injectable()
export class GamesService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly databaseService: DatabaseService,
    private eventEmitter: EventEmitter2,
  ) {}

  private readonly durations = {
    0: 1,
    1: 3,
    2: 5,
  };

  private readonly numbers = Numbers;

  findPredefinedWinningNumber(result: string) {
    const VALID_RESULTS = {
      small: [0, 1, 2, 3, 4],
      big: [5, 6, 7, 8, 9],
      green: [0, 2, 4, 6, 8],
      red: [1, 3, 5, 7, 9],
      violet: [0, 5],
    };

    const possibleWinningNumbes = VALID_RESULTS[result];

    if (!possibleWinningNumbes) {
      return null;
    }

    return possibleWinningNumbes[
      Math.floor(Math.random() * possibleWinningNumbes.length)
    ];
  }

  async findWinningNumber(game_id: number) {
    const betCount = await this.databaseService.bet.count({
      where: {
        gameId: game_id,
      },
    });

    if (betCount > 1) {
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

      const betAmountSum_groupBy_prediction =
        await this.databaseService.bet.groupBy({
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
    } else {
      const possibleWinningNumbes: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

      return possibleWinningNumbes[
        Math.floor(Math.random() * possibleWinningNumbes.length)
      ];
    }
  }

  async create(createGameDto: CreateGameDto) {
    const gameDuration = this.durations[createGameDto.type];
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + gameDuration * 60 * 1000);

    try {
      const new_game = await this.databaseService.game.create({
        data: {
          type: createGameDto.type,
          serial: createGameDto.serial.toString(),
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
    const parsedType = type ? parseInt(type) : undefined;
    const parsedLimit = parseInt(limit);
    const parsedSkip = parseInt(skip);

    if (isNaN(parsedLimit) || isNaN(parsedSkip)) {
      throw new BadRequestException('Invalid params.');
    }

    const cacheKey = `${cached_keys.CACHED_RECENT_GAMES}_${parsedType}`;

    const isFirstPage = parsedLimit === 10 && parsedSkip === 0;
    if (isFirstPage) {
      const cached_recents = await this.cacheManager.get(cacheKey);
      if (cached_recents) {
        return { success: true, data: cached_recents, cachehit: true };
      }
    }

    const games = await this.databaseService.game.findMany({
      where: {
        type: parsedType,
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
        bets: {
          select: {
            id: true,
          },
        },
        wins: {
          select: {
            id: true,
          },
        },
      },
      take: parsedLimit,
      skip: parsedSkip,
    });

    const total = await this.databaseService.game.count({
      where: {
        type: parsedType,
        NOT: [
          {
            result: null,
          },
        ],
      },
    });

    if (type) {
      await this.cacheManager.set(cacheKey, { games, total }, 0);
    }

    return {
      success: true,
      data: {
        games,
        total,
      },
    };
  }

  async findOne(id: number) {
    const game = await this.databaseService.game.findFirst({
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
    const parsedType = parseInt(type);

    if (isNaN(parsedType)) {
      throw new BadRequestException(
        'Invalid game type. Must be a valid number.',
      );
    }

    const cacheKey = `${cached_keys.CACHED_CURRENT_GAME}_${parsedType}`;

    const cached_current = await this.cacheManager.get(cacheKey);
    if (cached_current) {
      return { success: true, data: cached_current, cachehit: true };
    }

    const game = await this.databaseService.game.findFirst({
      where: {
        type: parsedType,
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

    await this.cacheManager.set(cacheKey, game, 0);

    return { success: true, data: game };
  }

  async findWins(type: string, limit: string, skip: string) {
    const parsedType = type ? parseInt(type) : undefined;
    const parsedLimit = parseInt(limit);
    const parsedSkip = parseInt(skip);

    const wins = await this.databaseService.win.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        game: {
          type: parsedType,
        },
      },
      include: {
        bet: {
          select: {
            amount: true,
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      take: parsedLimit,
      skip: parsedSkip,
    });

    const total = await this.databaseService.win.count({
      where: {
        game: {
          type: parsedType,
        },
      },
    });

    return { success: true, data: { wins, total } };
  }

  async findWinsByGameId(id: number, limit: string, skip: string) {
    const parsedLimit = parseInt(limit);
    const parsedSkip = parseInt(skip);

    const wins = await this.databaseService.win.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        gameId: id,
      },
      take: parsedLimit,
      skip: parsedSkip,
    });

    const total = await this.databaseService.win.findMany({
      where: {
        gameId: id,
      },
    });

    return { success: true, data: { wins, total } };
  }

  async update(id: number, updateGameDto: UpdateGameDto) {
    const game = await this.databaseService.game.update({
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
    await this.databaseService.game.delete({
      where: {
        id: id,
      },
    });

    return { success: true, data: `Deleted Game with GameID : #${id}` };
  }

  async issueNewGame(type: number = 0) {
    if (isNaN(type)) {
      throw new BadRequestException(
        'Invalid game type. Must be a valid number.',
      );
    }

    const currentDate = format(new Date(), 'yyyyMMdd');

    const lastGameWithNullResult = await this.databaseService.game.findFirst({
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

    if (lastGameWithNullResult) {
      let winning_number = null;

      const predefinedResult =
        await this.databaseService.predefinedResult.findFirst({
          where: {
            type: type,
            serial: lastGameWithNullResult.serial,
          },
        });

      if (predefinedResult) {
        winning_number = this.findPredefinedWinningNumber(
          predefinedResult.result,
        );
      }

      if (winning_number == null) {
        winning_number = await this.findWinningNumber(
          lastGameWithNullResult.id,
        );
      }

      // Draw Result of prv game.
      await this.update(lastGameWithNullResult.id, {
        result: winning_number.toString(),
      });

      // Process Winnings asynchronusly
      const resultAnnouncedEvent = new ResultAnnouncedEvent();
      resultAnnouncedEvent.gameId = lastGameWithNullResult.id;
      resultAnnouncedEvent.result = winning_number.toString();
      this.eventEmitter.emit('result.announced', resultAnnouncedEvent);

      console.log(
        `emitted result.announced with gameID : ${lastGameWithNullResult.id}`,
      );

      let newSerialNumber: number;

      const lastSerialDate = lastGameWithNullResult.serial.substring(0, 8);

      if (
        isSameDay(new Date(), parse(lastSerialDate, 'yyyyMMdd', new Date()))
      ) {
        const lastSerialNumeric = parseInt(
          lastGameWithNullResult.serial.substring(8),
          10,
        );
        newSerialNumber = parseInt(`${currentDate}${lastSerialNumeric + 1}`);
      } else {
        newSerialNumber = parseInt(`${currentDate}1`);
      }

      // Issue New Game
      const new_game = await this.create({
        type: type,
        serial: newSerialNumber,
      });

      await this.cacheManager.del(`${cached_keys.CACHED_CURRENT_GAME}_${type}`);
      await this.cacheManager.del(`${cached_keys.CACHED_RECENT_GAMES}_${type}`);

      return new_game;
    } else {
      const last_game = await this.databaseService.game.findFirst({
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
        let newSerialNumber: number;

        const lastSerialDate = last_game.serial.substring(0, 8);

        if (
          isSameDay(new Date(), parse(lastSerialDate, 'yyyyMMdd', new Date()))
        ) {
          const lastSerialNumeric = parseInt(last_game.serial.substring(8), 10);
          newSerialNumber = parseInt(`${currentDate}${lastSerialNumeric + 1}`);
        } else {
          newSerialNumber = parseInt(`${currentDate}1`);
        }

        // Issue New Game
        const new_game = await this.create({
          type: type,
          serial: newSerialNumber,
        });

        await this.cacheManager.del(
          `${cached_keys.CACHED_CURRENT_GAME}_${type}`,
        );
        await this.cacheManager.del(
          `${cached_keys.CACHED_RECENT_GAMES}_${type}`,
        );

        return new_game;
      } else {
        const newSerialNumber = parseInt(`${currentDate}1`);
        // Issue New Game
        const new_game = await this.create({
          type: type,
          serial: newSerialNumber,
        });

        await this.cacheManager.del(
          `${cached_keys.CACHED_CURRENT_GAME}_${type}`,
        );
        await this.cacheManager.del(
          `${cached_keys.CACHED_RECENT_GAMES}_${type}`,
        );

        return new_game;
      }
    }
  }

  async predefineResult(type: number, serial: string, result: string) {
    const predefinedResult = await this.databaseService.predefinedResult.create(
      {
        data: {
          type,
          serial,
          result,
        },
      },
    );

    return { success: true, data: predefinedResult };
  }

  async deleteResult(id: number) {
    const predefinedResult = await this.databaseService.predefinedResult.delete(
      {
        where: {
          id,
        },
      },
    );

    return { success: true, message: 'success' };
  }

  async getPredefinedResults() {
    const results = await this.databaseService.predefinedResult.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, data: results };
  }
}
