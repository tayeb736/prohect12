import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@Req() req: any) {
    return this.usersService.getProfile(req.user.sub);
  }

  @Patch('profile')
  updateProfile(@Req() req: any, @Body() dto: any) {
    return this.usersService.updateProfile(req.user.sub, dto);
  }
}
