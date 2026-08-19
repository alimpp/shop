import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressesModule } from '../addresses/addresses.module';
import { Address } from '../addresses/entities/address.entity';
import { CartModule } from '../cart/cart.module';
import { CartItem } from '../cart/entities/cart-item.entity';
import { ChatModule } from '../chat/chat.module';
import { UserEntity } from '../entities/user.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { FavoritesModule } from '../favorites/favorites.module';
import { Comment } from '../interactions/entities/comment.entity';
import { Like } from '../interactions/entities/like.entity';
import { InteractionsModule } from '../interactions/interactions.module';
import { Order } from '../orders/entities/order.entity';
import { OrdersModule } from '../orders/orders.module';
import { AdminUsersService } from './admin-users.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      CartItem,
      Order,
      Favorite,
      Like,
      Comment,
      Address,
    ]),
    CartModule,
    OrdersModule,
    FavoritesModule,
    InteractionsModule,
    ChatModule,
    AddressesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, AdminUsersService],
  exports: [UsersService],
})
export class UsersModule {}
