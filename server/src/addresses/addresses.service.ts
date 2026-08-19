import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from './entities/address.entity';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async findAll(userId: string) {
    const items = await this.addressRepository.find({
      where: { userId },
      order: { updated_at: 'DESC' },
    });

    return items.map((item) => this.toResponse(item));
  }

  async create(userId: string, dto: CreateAddressDto) {
    const address = await this.addressRepository.save(
      this.addressRepository.create({
        userId,
        ...this.normalize(dto),
      }),
    );

    return this.toResponse(address);
  }

  async update(userId: string, id: string, dto: UpdateAddressDto) {
    const address = await this.getOwned(userId, id);
    const next = this.normalize({
      name: dto.name ?? address.name,
      province: dto.province ?? address.province,
      city: dto.city ?? address.city,
      address: dto.address ?? address.address,
      postalCode: dto.postalCode ?? address.postalCode,
    });

    Object.assign(address, next);
    const saved = await this.addressRepository.save(address);
    return this.toResponse(saved);
  }

  async remove(userId: string, id: string) {
    const address = await this.getOwned(userId, id);
    await this.addressRepository.delete(address.id);
    return { id: address.id };
  }

  async findOwned(userId: string, id: string) {
    return this.toResponse(await this.getOwned(userId, id));
  }

  private async getOwned(userId: string, id: string) {
    const address = await this.addressRepository.findOne({ where: { id } });

    if (!address) {
      throw new NotFoundException('آدرس یافت نشد');
    }

    if (address.userId !== userId) {
      throw new ForbiddenException('دسترسی به این آدرس مجاز نیست');
    }

    return address;
  }

  private normalize(dto: CreateAddressDto) {
    return {
      name: dto.name.trim(),
      province: dto.province.trim(),
      city: dto.city.trim(),
      address: dto.address.trim(),
      postalCode: dto.postalCode.trim(),
    };
  }

  private toResponse(address: Address) {
    return {
      id: address.id,
      userId: address.userId,
      name: address.name,
      province: address.province,
      city: address.city,
      address: address.address,
      postalCode: address.postalCode,
      created_at: address.created_at,
      updated_at: address.updated_at,
    };
  }
}
