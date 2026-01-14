import { UserSummaryDto } from "src/users/dto/user-summary.dto";
import { User } from "src/users/entities/user.entity";

export class UserMapper {
    static toUserSummaryDtos(users: User[]): UserSummaryDto[] {
        return users.map(user => ({
            id: user.id,
            name: user.firstName + ' ' + user.lastName,
            roles: user.roles,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }));
    }
}