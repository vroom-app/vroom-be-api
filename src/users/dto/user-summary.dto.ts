import { UserRole } from "../entities/user.entity";

export class UserSummaryDto {
  id: number;
  name: string;
  roles: UserRole[];
  createdAt: Date;
  updatedAt: Date;
}
