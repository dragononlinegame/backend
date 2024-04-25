import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { issue_type, response, roles } from '@prisma/client';

@Injectable()
export class SupportService {
  constructor(private readonly databaseService: DatabaseService) {}

  async raiseAnIssue(
    userid: number,
    type: string,
    amount: string,
    ref: string,
    note: string,
  ) {
    const issue = await this.databaseService.issue.create({
      data: {
        userid,
        type: type as issue_type,
        amount,
        ref,
        note,
      },
    });

    return {
      success: true,
      data: issue,
      message: 'issue raised successfully.',
    };
  }

  async getIssueById(role: string, userid: number, issueid: number) {
    const issue = await this.databaseService.issue.findFirst({
      where: {
        id: issueid,
        userid: role === roles.Admin ? undefined : userid,
      },
      include: {
        responses: {
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            message: true,
            responseBy: true,
            createdAt: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!issue) return { success: false, message: 'issue not found' };

    return { success: true, data: issue };
  }

  async response(
    role: string,
    userid: number,
    issueid: number,
    message: string,
  ) {
    if (role === 'User') {
      const issue = await this.databaseService.issue.findFirst({
        where: {
          id: issueid,
          userid: userid,
        },
      });

      if (!issue) return { success: false, message: 'issue not found' };

      if (issue.status !== 'Pending')
        return {
          success: false,
          message: 'can not response to a resolved issue',
        };
    }

    const response = await this.databaseService.response.create({
      data: {
        issueId: issueid,
        message: message,
        responseBy: role === 'User' ? 'Issuer' : 'Resolver',
      },
    });

    return { success: true, data: response };
  }

  async resolve(issueid: number, status: boolean, response: string) {
    const issue = await this.databaseService.issue.update({
      where: {
        id: issueid,
      },
      data: {
        status: status ? 'Completed' : 'Failed',
        response: response,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return {
      success: true,
      data: issue,
      message: 'issue resolved successfully',
    };
  }

  async getIssuesByUserId(userid: number) {
    const issues = await this.databaseService.issue.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        userid,
      },
    });

    return { success: true, data: issues };
  }

  async getAllIssues(limit = 10, skip = 0, status = undefined) {
    const issues = await this.databaseService.issue.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        status: status,
      },
      take: limit,
      skip,
      include: {
        user: {
          select: {
            username: true,
            id: true,
          },
        },
      },
    });

    const total = await this.databaseService.issue.count({
      where: {
        status,
      },
    });

    return { success: true, data: { issues, total } };
  }
}
