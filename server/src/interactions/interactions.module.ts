import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { Blog } from '../blog/entities/blog.entity';
import { Product } from '../product/entities/product.entity';
import { Comment } from './entities/comment.entity';
import { Like } from './entities/like.entity';
import { InteractionsController } from './interactions.controller';
import { InteractionsService } from './interactions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Like, Comment, Product, Blog, UserEntity]),
  ],
  controllers: [InteractionsController],
  providers: [InteractionsService],
  exports: [InteractionsService],
})
export class InteractionsModule {}
