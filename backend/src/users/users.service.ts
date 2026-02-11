import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from 'shared';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    this.logger.log(`Creating user with email: ${createUserDto.email}`);
    const user = this.usersRepository.create(createUserDto);
    const savedUser = await this.usersRepository.save(user);
    return this.toDto(savedUser);
  }

  async findAll(): Promise<UserDto[]> {
    this.logger.log('Fetching all users');
    const users = await this.usersRepository.find();
    return users.map((user) => this.toDto(user));
  }

  async findOne(id: string): Promise<UserDto | null> {
    this.logger.log(`Fetching user with ID: ${id}`);
    const user = await this.usersRepository.findOne({ where: { id } });
    return user ? this.toDto(user) : null;
  }

  private toDto(user: User): UserDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
