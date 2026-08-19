import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { AddressesService } from '../addresses/addresses.service';
import { Address } from '../addresses/entities/address.entity';
import { CartService } from '../cart/cart.service';
import { CartItem } from '../cart/entities/cart-item.entity';
import { ChatService } from '../chat/chat.service';
import { UserEntity } from '../entities/user.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { FavoritesService } from '../favorites/favorites.service';
import { Comment } from '../interactions/entities/comment.entity';
import { Like } from '../interactions/entities/like.entity';
import { InteractionsService } from '../interactions/interactions.service';
import { Order } from '../orders/entities/order.entity';
import { OrdersService } from '../orders/orders.service';
import { QueryAdminUsersDto } from './dto/query-admin-users.dto';

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,

    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,

    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,

    private readonly cartService: CartService,
    private readonly ordersService: OrdersService,
    private readonly favoritesService: FavoritesService,
    private readonly interactionsService: InteractionsService,
    private readonly addressesService: AddressesService,
    private readonly chatService: ChatService,
  ) {}

  async findAll(query: QueryAdminUsersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const qb = this.userRepository
      .createQueryBuilder('user')
      .orderBy('user.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.andWhere(
        new Brackets((where) => {
          where
            .where('user.phone ILIKE :search', { search: `%${search}%` })
            .orWhere('user.fristname ILIKE :search', { search: `%${search}%` })
            .orWhere('user.lastname ILIKE :search', { search: `%${search}%` })
            .orWhere('user.email ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    const [users, total] = await qb.getManyAndCount();

    return {
      items: users.map((user) => this.toUser(user)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getOverview(id: string) {
    const user = await this.getUserOrFail(id);
    const [
      orders,
      cartItems,
      favorites,
      likes,
      comments,
      addresses,
    ] = await Promise.all([
      this.orderRepository.count({ where: { userId: id } }),
      this.cartItemRepository.count({ where: { userId: id } }),
      this.favoriteRepository.count({ where: { userId: id } }),
      this.likeRepository.count({ where: { userId: id } }),
      this.commentRepository.count({ where: { userId: id } }),
      this.addressRepository.count({ where: { userId: id } }),
    ]);

    return {
      user: this.toUser(user),
      stats: {
        orders,
        cartItems,
        favorites,
        likes,
        comments,
        addresses,
      },
    };
  }

  async getCart(id: string) {
    await this.getUserOrFail(id);
    return this.cartService.getCart(id);
  }

  async getOrders(id: string, page = 1, limit = 50) {
    await this.getUserOrFail(id);
    return this.ordersService.findAllForUser(id, { page, limit });
  }

  async getFavorites(id: string, page = 1, limit = 50) {
    await this.getUserOrFail(id);
    return this.favoritesService.findAll(id, page, limit);
  }

  async getLikes(id: string, page = 1, limit = 50) {
    await this.getUserOrFail(id);
    return this.interactionsService.findLikesByUser(id, page, limit);
  }

  async getComments(id: string, page = 1, limit = 50) {
    await this.getUserOrFail(id);
    return this.interactionsService.findCommentsByUser(id, page, limit);
  }

  async getAddresses(id: string) {
    await this.getUserOrFail(id);
    return this.addressesService.findAll(id);
  }

  async getOrCreateChat(id: string, adminId: string) {
    await this.getUserOrFail(id);
    const chat = await this.chatService.findOrCreateSupportChatForUser(
      id,
      adminId,
    );

    if (!chat.user) {
      const user = await this.getUserOrFail(id);
      return {
        ...chat,
        user: {
          id: user.id,
          fristname: user.fristname,
          lastname: user.lastname,
          avatarUrl: user.avatarUrl,
          phone: user.phone,
        },
      };
    }

    return chat;
  }

  private async getUserOrFail(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }
    return user;
  }

  private toUser(user: UserEntity) {
    return {
      id: user.id,
      fristname: user.fristname,
      lastname: user.lastname,
      email: user.email,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      created_at: user.created_at,
    };
  }
}
