import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../product/entities/product.entity';
import { BehaviorController } from './behavior.controller';
import { BehaviorService } from './behavior.service';
import { UserProductEvent } from './entities/user-product-event.entity';
import { UserProductInterest } from './entities/user-product-interest.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserProductEvent,
      UserProductInterest,
      Product,
    ]),
  ],
  controllers: [BehaviorController],
  providers: [BehaviorService],
  exports: [BehaviorService],
})
export class BehaviorModule {}
