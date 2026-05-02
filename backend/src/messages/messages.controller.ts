import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  sendMessage(@Req() req: any, @Body() dto: SendMessageDto) {
    return this.messagesService.sendMessage(req.user.sub, dto);
  }

  @Get('conversations')
  getMyConversations(@Req() req: any) {
    return this.messagesService.getMyConversations(req.user.sub);
  }

  @Get(':conversationId')
  getMessages(@Req() req: any, @Param('conversationId') id: string) {
    return this.messagesService.getMessages(req.user.sub, id);
  }
}
