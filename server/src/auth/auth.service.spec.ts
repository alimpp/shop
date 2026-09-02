import { UnauthorizedException } from '@nestjs/common';

jest.mock('@nestjs/jwt', () => ({
  JwtService: class JwtService {},
}));

import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

describe('AuthService (critical)', () => {
  const usersService = {
    getUserByPhone: jest.fn(),
    createUser: jest.fn(),
  };
  const jwtService = {
    sign: jest.fn().mockReturnValue('signed-token'),
  };
  const otpService = {
    generateOtp: jest.fn(),
    verifyOtp: jest.fn(),
  };
  const adminService = {
    findAdmin: jest.fn(),
  };

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(
      usersService as any,
      jwtService as unknown as JwtService,
      otpService as any,
      adminService as any,
    );
  });

  describe('verifyOtp', () => {
    it('throws when otp is invalid', async () => {
      otpService.verifyOtp.mockResolvedValue(false);

      await expect(service.verifyOtp('09120000000', '0000')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('creates user and returns access token for new phone', async () => {
      otpService.verifyOtp.mockResolvedValue(true);
      usersService.getUserByPhone.mockResolvedValue(null);
      usersService.createUser.mockResolvedValue({
        id: 'user-1',
        phone: '09120000000',
      });

      const result = await service.verifyOtp('09120000000', '1234');

      expect(usersService.createUser).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        phoneNumber: '09120000000',
      });
      expect(result).toEqual({ accessToken: 'signed-token' });
    });

    it('reuses existing user', async () => {
      otpService.verifyOtp.mockResolvedValue(true);
      usersService.getUserByPhone.mockResolvedValue({
        id: 'user-2',
        phone: '09121111111',
      });

      const result = await service.verifyOtp('09121111111', '9999');

      expect(usersService.createUser).not.toHaveBeenCalled();
      expect(result.accessToken).toBe('signed-token');
    });
  });

  describe('login (admin)', () => {
    it('throws when credentials are wrong', async () => {
      adminService.findAdmin.mockResolvedValue(null);

      await expect(
        service.login({ username: 'admin', password: 'bad' } as any),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('returns admin token on success', async () => {
      adminService.findAdmin.mockResolvedValue({
        id: 'admin-1',
        username: 'admin',
      });

      const result = await service.login({
        username: 'admin',
        password: 'secret',
      } as any);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'admin-1',
        role: 'admin',
      });
      expect(result).toEqual({
        id: 'admin-1',
        username: 'admin',
        token: 'signed-token',
      });
    });
  });

  describe('validateUser', () => {
    it('throws when user is missing', async () => {
      usersService.getUserByPhone.mockResolvedValue(null);
      await expect(service.validateUser('09120000000')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });
});
