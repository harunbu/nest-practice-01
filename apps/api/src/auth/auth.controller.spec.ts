import {
  BadRequestException,
  ConflictException,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { createMockPrisma } from '../test-utils/mock-prisma';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('AuthController (integration)', () => {
  const prisma = createMockPrisma();
  const validationPipe = new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  });

  let authController: AuthController;

  async function validateBody<T>(
    value: unknown,
    metatype: new () => T,
  ): Promise<T> {
    return validationPipe.transform(value, {
      type: 'body',
      metatype,
      data: '',
    }) as Promise<T>;
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    authController = moduleRef.get(AuthController);
  });

  it('registers and then logs in the same user', async () => {
    const registerDto = await validateBody(
      {
        email: 'alice@example.com',
        password: 'password123',
      },
      RegisterDto,
    );
    const registerResult = await authController.register(registerDto);

    expect(typeof registerResult.accessToken).toBe('string');
    expect(registerResult.user.id).toBe('user-1');
    expect(registerResult.user.email).toBe('alice@example.com');
    expect(typeof registerResult.user.createdAt).toBe('string');

    const loginDto = await validateBody(
      {
        email: 'Alice@example.com',
        password: 'password123',
      },
      LoginDto,
    );
    const loginResult = await authController.login(loginDto);

    expect(typeof loginResult.accessToken).toBe('string');
    expect(loginResult.user.id).toBe('user-1');
    expect(loginResult.user.email).toBe('alice@example.com');
    expect(typeof loginResult.user.createdAt).toBe('string');
  });

  it('rejects duplicate registration and short passwords', async () => {
    const duplicateDto = await validateBody(
      {
        email: 'alice@example.com',
        password: 'password123',
      },
      RegisterDto,
    );

    await expect(authController.register(duplicateDto)).rejects.toBeInstanceOf(
      ConflictException,
    );

    try {
      await validateBody(
        {
          email: 'bob@example.com',
          password: 'short',
        },
        RegisterDto,
      );
      throw new Error('Expected validation to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const response = (error as BadRequestException).getResponse() as {
        message: string[];
      };
      expect(response.message).toContain(
        'password must be longer than or equal to 8 characters',
      );
    }
  });
});
