import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthProvider, User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

interface CreateOAuthUserData {
  email: string;
  firstName: string;
  lastName: string;
  provider: AuthProvider;
  providerId: string;
  avatarUrl?: string;
  emailVerified: boolean;
  country?: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByProviderId(
    provider: AuthProvider,
    providerId: string,
  ): Promise<User | null> {
    return this.usersRepository.findOne({
      where: {
        provider,
        providerId,
      },
    });
  }

  async create(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    country: string = 'BG',
    phone?: string,
  ): Promise<User> {
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = this.usersRepository.create({
      email,
      passwordHash,
      firstName,
      lastName,
      country,
      phone,
      provider: AuthProvider.LOCAL,
      emailVerified: false,
    });

    return this.usersRepository.save(user);
  }

  async createOAuthUser(userData: CreateOAuthUserData): Promise<User> {
    const user = this.usersRepository.create({
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      provider: userData.provider,
      providerId: userData.providerId,
      avatarUrl: userData.avatarUrl,
      emailVerified: userData.emailVerified,
      country: userData.country || 'BG',
    });

    return this.usersRepository.save(user);
  }

  async update(id: number, updateData: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, updateData);
    return this.findOne(id);
  }
}
