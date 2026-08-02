import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminEntity } from 'src/entities/admin.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminEntity,
    ]),
  ],
  providers: [
    AdminService, 
  ],
  controllers: [AdminController]
})
export class AdminModule {}
