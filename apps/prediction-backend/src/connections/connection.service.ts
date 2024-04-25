import { Injectable } from '@nestjs/common';
import { sub } from 'date-fns';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ConnectionService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(userOne: number, userTwo: number) {
    const existingConnection = await this.databaseService.connection.count({
      where: {
        OR: [
          {
            userOneId: userTwo,
          },
          {
            userTwoId: userTwo,
          },
        ],
      },
    });

    if (existingConnection) {
      return { success: true, data: existingConnection };
    }

    const connection = await this.databaseService.connection.create({
      data: {
        userOneId: userOne,
        userTwoId: userTwo,
      },
    });

    return { success: true, data: connection };
  }

  async connectionByUserId(userid: number) {
    const connections = await this.databaseService.connection.findMany({
      where: {
        OR: [
          {
            userOneId: userid,
          },
          {
            userTwoId: userid,
          },
        ],
      },
      select: {
        id: true,
        userOneId: true,
        userTwoId: true,
        userOne: {
          select: {
            id: true,
            username: true,
          },
        },
        userTwo: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return { success: true, data: connections };
  }

  async getConnectionById(id: number) {
    const connection = await this.databaseService.connection.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        userOneId: true,
        userTwoId: true,
        userOne: {
          select: {
            id: true,
            username: true,
          },
        },
        userTwo: {
          select: {
            id: true,
            username: true,
          },
        },
        requests: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    return {
      success: true,
      data: {
        ...connection,
        requests: connection.requests.map((req) => ({
          ...req,
          id: Number(req.id),
        })),
      },
    };
  }

  async createRequest(
    connectionId: number,
    senderId: number,
    receiverId: number,
    amount: number,
  ) {
    const request = await this.databaseService.request.create({
      data: {
        connectionId: connectionId,
        senderId: senderId,
        receiverId: receiverId,
        amount: amount,
      },
    });

    return {
      success: true,
      data: { ...request, id: Number(request.id) },
    };
  }

  async updateRequest(userid: number, reqId: number, action: string) {
    const user = await this.databaseService.user.findFirst({
      where: {
        id: userid,
      },
      select: {
        id: true,
        password: true,
        wallet: {
          select: {
            balance: true,
          },
        },
      },
    });

    const request = await this.databaseService.request.findFirst({
      where: {
        id: reqId,
      },
    });

    if (request.receiverId !== user.id) {
      return { success: false, message: 'Invalid Request.' };
    }

    if (action === 'PAY') {
      if (Number(user.wallet.balance) < Number(request.amount)) {
        return { success: false, message: 'Insufficient Balance.' };
      }

      await this.databaseService.wallet.update({
        where: {
          userId: request.senderId,
        },
        data: {
          balance: {
            increment: request.amount,
          },
        },
      });

      await this.databaseService.wallet.update({
        where: {
          userId: request.receiverId,
        },
        data: {
          balance: {
            decrement: request.amount,
          },
        },
      });

      const updatedRequest = await this.databaseService.request.update({
        where: {
          id: request.id,
        },
        data: {
          status: 'Paid',
        },
      });

      return {
        success: true,
        data: { ...updatedRequest, id: Number(updatedRequest.id) },
        message: 'Amount has been sent successfully.',
      };
    }
    if (action === 'DECLINE') {
      const updatedRequest = await this.databaseService.request.update({
        where: {
          id: request.id,
        },
        data: {
          status: 'Declined',
        },
      });

      return {
        success: true,
        data: { ...updatedRequest, id: Number(updatedRequest.id) },
        message: 'Request has been declined successfully.',
      };
    }
  }
}
