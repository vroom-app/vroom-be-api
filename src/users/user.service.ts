import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

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

  async create(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    country: string = 'BG',
    phone?: string,
  ): Promise<User> {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = this.usersRepository.create({
      email,
      passwordHash,
      firstName,
      lastName,
      country,
      phone,
      roles: [UserRole.USER],
    });

    return this.usersRepository.save(user);
  }

  async addRole(userId: number, role: UserRole): Promise<User> {
    const user = await this.findOne(userId);

    if (!user.roles.includes(role)) {
      user.roles.push(role);
      return this.usersRepository.save(user);
    }

    return user;
  }

  async removeRole(userId: number, role: UserRole): Promise<User> {
    const user = await this.findOne(userId);

    user.roles = user.roles.filter((r) => r !== role);

    return this.usersRepository.save(user);
  }
}
