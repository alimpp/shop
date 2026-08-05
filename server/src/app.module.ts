import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { pgConfig } from 'dbConfig';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { BannersModule } from './banners/banners.module';
import { CategoriesModule } from './categories/categories.module';
import { FileModule } from './file/file.module';
import { OtpModule } from './otp/otp.module';
import { ProductModule } from './product/product.module';
import { StoryModule } from './story/story.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    FileModule,
    OtpModule,
    AdminModule,
    BannersModule,
    CategoriesModule,
    ProductModule,
    StoryModule,
    TypeOrmModule.forRoot(pgConfig),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
