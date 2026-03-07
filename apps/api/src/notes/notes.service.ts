import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Note } from '@repo/shared';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateNoteDto } from './dto/create-note.dto';
import type { QueryNotesDto } from './dto/query-notes.dto';
import type { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, query: QueryNotesDto): Promise<Note[]> {
    const tag = query.tag?.trim().toLowerCase();
    const notes = await this.prisma.note.findMany({
      where: {
        userId,
        ...(tag
          ? {
              noteTags: {
                some: {
                  tag: {
                    name: tag,
                  },
                },
              },
            }
          : {}),
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        noteTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return notes.map((note) => this.toNote(note));
  }

  async findOne(userId: string, noteId: string): Promise<Note> {
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
      include: {
        noteTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found.');
    }

    if (note.userId !== userId) {
      throw new ForbiddenException('You cannot access this note.');
    }

    return this.toNote(note);
  }

  async create(userId: string, dto: CreateNoteDto): Promise<Note> {
    const normalizedTags = this.normalizeTags(dto.tags);

    const note = await this.prisma.$transaction(async (tx) => {
      const tags: Array<{ id: string }> = [];

      for (const tagName of normalizedTags) {
        const tag = await tx.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName },
        });

        tags.push(tag);
      }

      return tx.note.create({
        data: {
          userId,
          title: dto.title.trim(),
          content: dto.content,
          noteTags: {
            create: tags.map((tag) => ({
              tagId: tag.id,
            })),
          },
        },
        include: {
          noteTags: {
            include: {
              tag: true,
            },
          },
        },
      });
    });

    return this.toNote(note);
  }

  async update(
    userId: string,
    noteId: string,
    dto: UpdateNoteDto,
  ): Promise<Note> {
    await this.ensureOwnership(userId, noteId);

    const normalizedTags = dto.tags ? this.normalizeTags(dto.tags) : null;

    const note = await this.prisma.$transaction(async (tx) => {
      let tagIds: string[] | null = null;

      if (normalizedTags) {
        tagIds = [];

        for (const tagName of normalizedTags) {
          const tag = await tx.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName },
          });

          tagIds.push(tag.id);
        }
      }

      return tx.note.update({
        where: { id: noteId },
        data: {
          ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
          ...(dto.content !== undefined ? { content: dto.content } : {}),
          ...(tagIds
            ? {
                noteTags: {
                  deleteMany: {},
                  create: tagIds.map((tagId) => ({ tagId })),
                },
              }
            : {}),
        },
        include: {
          noteTags: {
            include: {
              tag: true,
            },
          },
        },
      });
    });

    return this.toNote(note);
  }

  async remove(userId: string, noteId: string): Promise<void> {
    await this.ensureOwnership(userId, noteId);
    await this.prisma.note.delete({
      where: { id: noteId },
    });
  }

  private async ensureOwnership(userId: string, noteId: string): Promise<void> {
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found.');
    }

    if (note.userId !== userId) {
      throw new ForbiddenException('You cannot modify this note.');
    }
  }

  private normalizeTags(tags: string[] | undefined): string[] {
    if (!tags) {
      return [];
    }

    return [
      ...new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean)),
    ];
  }

  private toNote(note: {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    noteTags: Array<{
      tag: {
        id: string;
        name: string;
      };
    }>;
  }): Note {
    return {
      id: note.id,
      title: note.title,
      content: note.content,
      tags: note.noteTags.map(({ tag }) => ({
        id: tag.id,
        name: tag.name,
      })),
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    };
  }
}
