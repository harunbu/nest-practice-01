import { ForbiddenException, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { AuthController } from '../auth/auth.controller';
import type { AuthenticatedUser } from '../auth/auth.types';
import { RegisterDto } from '../auth/dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';
import { createMockPrisma } from '../test-utils/mock-prisma';
import { CreateNoteDto } from './dto/create-note.dto';
import { QueryNotesDto } from './dto/query-notes.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotesController } from './notes.controller';

describe('NotesController (integration)', () => {
  const prisma = createMockPrisma();
  const validationPipe = new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  });

  let authController: AuthController;
  let notesController: NotesController;

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

  async function validateQuery<T>(
    value: unknown,
    metatype: new () => T,
  ): Promise<T> {
    return validationPipe.transform(value, {
      type: 'query',
      metatype,
      data: '',
    }) as Promise<T>;
  }

  async function registerUser(email: string): Promise<AuthenticatedUser> {
    const registerResult = await authController.register(
      await validateBody(
        {
          email,
          password: 'password123',
        },
        RegisterDto,
      ),
    );

    return {
      userId: registerResult.user.id,
      email: registerResult.user.email,
    };
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    authController = moduleRef.get(AuthController);
    notesController = moduleRef.get(NotesController);
  });

  it('creates, filters, updates, fetches, and deletes notes for the authenticated user', async () => {
    const user = await registerUser('notes@example.com');

    const createdNote = await notesController.create(
      user,
      await validateBody(
        {
          title: 'First note',
          content: 'Draft content',
          tags: ['React', 'nextjs', 'React'],
        },
        CreateNoteDto,
      ),
    );

    expect(typeof createdNote.id).toBe('string');
    expect(createdNote.title).toBe('First note');
    expect(createdNote.content).toBe('Draft content');
    expect(createdNote.tags).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'react' }),
        expect.objectContaining({ name: 'nextjs' }),
      ]),
    );

    const filteredNotes = await notesController.findAll(
      user,
      await validateQuery({ tag: 'react' }, QueryNotesDto),
    );

    expect(filteredNotes).toHaveLength(1);
    expect(filteredNotes[0]?.id).toBe(createdNote.id);

    const updatedNote = await notesController.update(
      user,
      createdNote.id,
      await validateBody(
        {
          title: 'Updated note',
          content: 'Updated content',
          tags: ['testing'],
        },
        UpdateNoteDto,
      ),
    );

    expect(updatedNote.title).toBe('Updated note');
    expect(updatedNote.tags).toEqual([
      expect.objectContaining({ name: 'testing' }),
    ]);

    const detailNote = await notesController.findOne(user, createdNote.id);

    expect(detailNote).toMatchObject({
      id: createdNote.id,
      title: 'Updated note',
      content: 'Updated content',
    });

    await notesController.remove(user, createdNote.id);

    await expect(notesController.findOne(user, createdNote.id)).rejects.toThrow(
      'Note not found.',
    );
  });

  it('forbids access to another user note', async () => {
    const owner = await registerUser('owner@example.com');
    const stranger = await registerUser('stranger@example.com');

    const createdNote = await notesController.create(
      owner,
      await validateBody(
        {
          title: 'Private note',
          content: 'Only owner can access this',
        },
        CreateNoteDto,
      ),
    );

    await expect(
      notesController.findOne(stranger, createdNote.id),
    ).rejects.toBeInstanceOf(ForbiddenException);

    await expect(
      notesController.update(
        stranger,
        createdNote.id,
        await validateBody(
          {
            title: 'Hacked',
          },
          UpdateNoteDto,
        ),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
