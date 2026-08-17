import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { pgConfig } from 'dbConfig';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { BannersModule } from './banners/banners.module';
import { BlogModule } from './blog/blog.module';
import { CategoriesModule } from './categories/categories.module';
import { FavoritesModule } from './favorites/favorites.module';
import { FileModule } from './file/file.module';
import { InteractionsModule } from './interactions/interactions.module';
import { OtpModule } from './otp/otp.module';
import { ProductModule } from './product/product.module';
import { StoryModule } from './story/story.module';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    FileModule,
    OtpModule,
    AdminModule,
    BannersModule,
    BlogModule,
    CategoriesModule,
    FavoritesModule,
    InteractionsModule,
    ProductModule,
    StoryModule,
    ChatModule,
    NotificationsModule,
    TypeOrmModule.forRoot(pgConfig),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
