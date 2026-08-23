import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from '../cart/entities/cart-item.entity';
import { ChatParticipant } from '../chat/entities/chat-participant.entity';
import { Chat } from '../chat/entities/chat.entity';
import { UserEntity } from '../entities/user.entity';
import { Comment } from '../interactions/entities/comment.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../product/entities/product.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Product,
      UserEntity,
      Chat,
      ChatParticipant,
      CartItem,
      Comment,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
