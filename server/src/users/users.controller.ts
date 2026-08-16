import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { CreateDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UsersService } from './users.service';

type AuthenticatedRequest = Request & {
  user: { sub: string; role?: string };
};

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/all')
  async getAllUsers() {
    return await this.usersService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getUserProfile(@Req() req: AuthenticatedRequest) {
    const user = await this.usersService.getUserById(req.user.sub);
    if (!user)
      throw new NotFoundException(
        `This user with id ${req.user.sub} not found`,
      );
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.getUserById(id);
    if (!user) throw new NotFoundException(`This user with id ${id} not found`);
    return user;
  }

  @Post('/register')
  async register(@Body() body: CreateDto) {
    return await this.usersService.createUser(body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/update')
  async update(@Req() req: AuthenticatedRequest, @Body() body: UpdateUserDto) {
    return await this.usersService.updateUser(req.user.sub, body);
  }
}
