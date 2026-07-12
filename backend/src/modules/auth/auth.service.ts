import { UserStatus } from '@prisma/client';
import { ApiError } from '../../utils/ApiError';
import { comparePassword } from '../../utils/password.util';
import { signAccessToken } from '../../utils/jwt.util';
import { authRepository, toSafeUser } from './auth.repository';
import { LoginInput, LoginResult, SafeUser } from './auth.types';

export const authService = {
  login: async (input: LoginInput): Promise<LoginResult> => {
    const user = await authRepository.findByEmail(input.email);

    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ApiError(403, 'Account is inactive');
    }

    const isPasswordValid = await comparePassword(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const updatedUser = await authRepository.updateLastLogin(user.id);
    const safeUser = toSafeUser(updatedUser);

    const accessToken = signAccessToken({
      sub: safeUser.id,
      email: safeUser.email,
      role: safeUser.role,
    });

    return {
      accessToken,
      user: safeUser,
    };
  },

  getProfile: async (userId: string): Promise<SafeUser> => {
    const user = await authRepository.findById(userId);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return toSafeUser(user);
  },
};
