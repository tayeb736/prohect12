import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(senderId: string, dto: SendMessageDto) {
    // 1. Find or Create Conversation
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        messages: {
          some: {
            OR: [
              { senderId, receiverId: dto.receiverId },
              { senderId: dto.receiverId, receiverId: senderId },
            ],
          },
        },
      },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: { productId: dto.productId },
      });
    }

    // 2. Create Message
    return this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId,
        receiverId: dto.receiverId,
        content: dto.content,
      },
    });
  }

  async getMyConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        messages: {
          some: { OR: [{ senderId: userId }, { receiverId: userId }] },
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async getMessages(userId: string, conversationId: string) {
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
