import { Controller, Post, Body, UseGuards, Req ,Get,Param,Patch,Delete} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  async createUser(
    @Req() req,
    @Body()
    body: {
      email: string;
      password: string;
      firstname?: string;
      lastname?: string;
      displayName?: string;
      employeeId?: string;
      role?: string;
    },
  ) {
    return this.usersService.createUser(req.user, body);
  }
   
  @Get()
  findAll(@Req() req: any) {
    return this.usersService.getAllUsers(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.usersService.getUserById(Number(id), req.user);
  }
@UseGuards(JwtAuthGuard)
@Patch(':id') 
update(@Param('id') id: string, @Body() updateDto: any, @Req() req: any) {
    console.log('Decoded user from JWT:', req.user);
  return this.usersService.updateUser(Number(id), updateDto, req.user);
}


  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.usersService.deleteUser(Number(id), req.user);
  }
}
