import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import type { AuthUser } from "@orange/shared-types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";

interface UserWithProfile {
  id: string;
  email: string;
  name: string | null;
}

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<AuthUser> {
    const user = await this.findUserOrThrow(userId);
    return this.toAuthUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<AuthUser> {
    await this.findUserOrThrow(userId);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { name: dto.name }
    });

    return this.toAuthUser(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { account: true }
    });

    if (!user?.account) {
      throw new NotFoundException("Account not found");
    }

    const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.account.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.account.update({
      where: { userId },
      data: { passwordHash }
    });
  }

  private async findUserOrThrow(userId: string): Promise<UserWithProfile> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  private toAuthUser(user: UserWithProfile): AuthUser {
    return { id: user.id, email: user.email, name: user.name };
  }
}
