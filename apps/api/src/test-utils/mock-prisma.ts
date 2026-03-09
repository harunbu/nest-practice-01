type MockUser = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
};

type MockTag = {
  id: string;
  name: string;
};

type MockNoteTag = {
  noteId: string;
  tagId: string;
};

type MockNote = {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

type NoteWithTags = MockNote & {
  noteTags: Array<{
    tag: MockTag;
  }>;
};

type UserFindUniqueArgs = {
  where: {
    email?: string;
  };
};

type UserCreateArgs = {
  data: {
    email: string;
    passwordHash: string;
  };
};

type TagUpsertArgs = {
  where: {
    name: string;
  };
  update: Record<string, never>;
  create: {
    name: string;
  };
};

type NoteFindManyArgs = {
  where: {
    userId: string;
    noteTags?: {
      some: {
        tag: {
          name: string;
        };
      };
    };
  };
  orderBy: {
    updatedAt: 'desc';
  };
  include: {
    noteTags: {
      include: {
        tag: true;
      };
    };
  };
};

type NoteFindUniqueArgs = {
  where: {
    id: string;
  };
  include?: {
    noteTags: {
      include: {
        tag: true;
      };
    };
  };
  select?: {
    id: true;
    userId: true;
  };
};

type NoteCreateArgs = {
  data: {
    userId: string;
    title: string;
    content: string;
    noteTags: {
      create: Array<{
        tagId: string;
      }>;
    };
  };
  include: {
    noteTags: {
      include: {
        tag: true;
      };
    };
  };
};

type NoteUpdateArgs = {
  where: {
    id: string;
  };
  data: {
    title?: string;
    content?: string;
    noteTags?: {
      deleteMany: Record<string, never>;
      create: Array<{
        tagId: string;
      }>;
    };
  };
  include: {
    noteTags: {
      include: {
        tag: true;
      };
    };
  };
};

type NoteDeleteArgs = {
  where: {
    id: string;
  };
};

export type MockPrisma = {
  user: {
    findUnique: jest.Mock<Promise<MockUser | null>, [UserFindUniqueArgs]>;
    create: jest.Mock<Promise<MockUser>, [UserCreateArgs]>;
  };
  tag: {
    upsert: jest.Mock<Promise<MockTag>, [TagUpsertArgs]>;
  };
  note: {
    findMany: jest.Mock<Promise<NoteWithTags[]>, [NoteFindManyArgs]>;
    findUnique: jest.Mock<
      Promise<NoteWithTags | { id: string; userId: string } | null>,
      [NoteFindUniqueArgs]
    >;
    create: jest.Mock<Promise<NoteWithTags>, [NoteCreateArgs]>;
    update: jest.Mock<Promise<NoteWithTags>, [NoteUpdateArgs]>;
    delete: jest.Mock<Promise<void>, [NoteDeleteArgs]>;
  };
  $transaction: jest.Mock<
    Promise<unknown>,
    [(tx: TransactionClient) => Promise<unknown>]
  >;
};

type TransactionClient = {
  tag: MockPrisma['tag'];
  note: Pick<MockPrisma['note'], 'create' | 'update'>;
};

export function createMockPrisma(): MockPrisma {
  let userSequence = 1;
  let tagSequence = 1;
  let noteSequence = 1;

  const users: MockUser[] = [];
  const tags: MockTag[] = [];
  const notes: MockNote[] = [];
  const noteTags: MockNoteTag[] = [];

  function buildNoteWithTags(note: MockNote): NoteWithTags {
    return {
      ...note,
      noteTags: noteTags
        .filter((entry) => entry.noteId === note.id)
        .map((entry) => ({
          tag: tags.find((tag) => tag.id === entry.tagId)!,
        })),
    };
  }

  function sortByUpdatedAtDesc(items: MockNote[]): MockNote[] {
    return [...items].sort(
      (left, right) => right.updatedAt.getTime() - left.updatedAt.getTime(),
    );
  }

  const prisma: MockPrisma = {
    user: {
      findUnique: jest.fn(({ where }: UserFindUniqueArgs) => {
        if (where.email) {
          return Promise.resolve(
            users.find((user) => user.email === where.email) ?? null,
          );
        }

        return Promise.resolve(null);
      }),
      create: jest.fn(({ data }: UserCreateArgs) => {
        const user: MockUser = {
          id: `user-${userSequence++}`,
          email: data.email,
          passwordHash: data.passwordHash,
          createdAt: new Date(),
        };
        users.push(user);
        return Promise.resolve(user);
      }),
    },
    tag: {
      upsert: jest.fn(({ where, create }: TagUpsertArgs) => {
        const existing = tags.find((tag) => tag.name === where.name);

        if (existing) {
          return Promise.resolve(existing);
        }

        const tag: MockTag = {
          id: `tag-${tagSequence++}`,
          name: create.name,
        };
        tags.push(tag);
        return Promise.resolve(tag);
      }),
    },
    note: {
      findMany: jest.fn(({ where }: NoteFindManyArgs) => {
        const filtered = notes.filter((note) => {
          if (note.userId !== where.userId) {
            return false;
          }

          const tagName = where.noteTags?.some.tag.name;

          if (!tagName) {
            return true;
          }

          return buildNoteWithTags(note).noteTags.some(
            ({ tag }) => tag.name === tagName,
          );
        });

        return Promise.resolve(
          sortByUpdatedAtDesc(filtered).map(buildNoteWithTags),
        );
      }),
      findUnique: jest.fn(({ where, select }: NoteFindUniqueArgs) => {
        const note = notes.find((entry) => entry.id === where.id) ?? null;

        if (!note) {
          return Promise.resolve(null);
        }

        if (select) {
          return Promise.resolve({
            id: note.id,
            userId: note.userId,
          });
        }

        return Promise.resolve(buildNoteWithTags(note));
      }),
      create: jest.fn(({ data }: NoteCreateArgs) => {
        const now = new Date();
        const note: MockNote = {
          id: `note-${noteSequence++}`,
          userId: data.userId,
          title: data.title,
          content: data.content,
          createdAt: now,
          updatedAt: now,
        };
        notes.push(note);
        noteTags.push(
          ...data.noteTags.create.map((entry) => ({
            noteId: note.id,
            tagId: entry.tagId,
          })),
        );
        return Promise.resolve(buildNoteWithTags(note));
      }),
      update: jest.fn(({ where, data }: NoteUpdateArgs) => {
        const note = notes.find((entry) => entry.id === where.id);

        if (!note) {
          throw new Error('Note not found');
        }

        if (data.title !== undefined) {
          note.title = data.title;
        }

        if (data.content !== undefined) {
          note.content = data.content;
        }

        if (data.noteTags) {
          for (let index = noteTags.length - 1; index >= 0; index -= 1) {
            if (noteTags[index].noteId === note.id) {
              noteTags.splice(index, 1);
            }
          }

          noteTags.push(
            ...data.noteTags.create.map((entry) => ({
              noteId: note.id,
              tagId: entry.tagId,
            })),
          );
        }

        note.updatedAt = new Date();
        return Promise.resolve(buildNoteWithTags(note));
      }),
      delete: jest.fn(({ where }: NoteDeleteArgs) => {
        const index = notes.findIndex((entry) => entry.id === where.id);

        if (index >= 0) {
          notes.splice(index, 1);
        }

        for (
          let entryIndex = noteTags.length - 1;
          entryIndex >= 0;
          entryIndex -= 1
        ) {
          if (noteTags[entryIndex].noteId === where.id) {
            noteTags.splice(entryIndex, 1);
          }
        }

        return Promise.resolve();
      }),
    },
    $transaction: jest.fn(
      (callback: (tx: TransactionClient) => Promise<unknown>) => {
        return callback({
          tag: prisma.tag,
          note: {
            create: prisma.note.create,
            update: prisma.note.update,
          },
        });
      },
    ),
  };

  return prisma;
}
