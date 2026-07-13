import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PostService } from './post.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PostService', () => {
  let service: PostService;
  let prisma: any;

  const mockPost = {
    id: 'post-1',
    companyId: 'comp-1',
    authorId: 'emp-1',
    authorName: 'John Doe',
    content: 'Hello team',
    likes: ['emp-2'],
    createdAt: new Date('2026-07-01'),
    comments: [],
  };

  beforeEach(async () => {
    prisma = {
      post: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      postComment: { create: vi.fn() },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<PostService>(PostService);
  });

  it('should return posts by company', async () => {
    prisma.post.findMany.mockResolvedValue([mockPost]);
    const result = await service.findByCompany('comp-1');
    expect(result).toHaveLength(1);
  });

  it('should throw NotFoundException when post not found', async () => {
    prisma.post.findUnique.mockResolvedValue(null);
    await expect(service.findById('unknown')).rejects.toThrow(NotFoundException);
  });

  it('should create a post', async () => {
    prisma.post.create.mockResolvedValue(mockPost);
    const result = await service.create({
      companyId: 'comp-1',
      authorId: 'emp-1',
      authorName: 'John Doe',
      content: 'Hello team',
    });
    expect(result.id).toBe('post-1');
  });

  it('should throw BadRequestException when content is empty', async () => {
    await expect(
      service.create({ companyId: 'comp-1', authorId: 'emp-1', authorName: 'John', content: '' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should add a like when not liked', async () => {
    prisma.post.findUnique.mockResolvedValue(mockPost);
    prisma.post.update.mockResolvedValue({ ...mockPost, likes: ['emp-2', 'emp-3'] });
    const result = await service.toggleLike('post-1', 'emp-3');
    expect(result.likes).toContain('emp-3');
  });

  it('should remove a like when already liked', async () => {
    prisma.post.findUnique.mockResolvedValue(mockPost);
    prisma.post.update.mockResolvedValue({ ...mockPost, likes: [] });
    const result = await service.toggleLike('post-1', 'emp-2');
    expect(result.likes).not.toContain('emp-2');
  });

  it('should add a comment', async () => {
    prisma.post.findUnique.mockResolvedValue(mockPost);
    prisma.postComment.create.mockResolvedValue({ id: 'c-1' });
    await service.addComment('post-1', { authorId: 'emp-2', authorName: 'Jane', content: 'Nice' });
    expect(prisma.postComment.create).toHaveBeenCalled();
  });

  it('should throw BadRequestException when comment content is empty', async () => {
    await expect(
      service.addComment('post-1', { authorId: 'emp-2', authorName: 'Jane', content: '' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should delete a post', async () => {
    prisma.post.findUnique.mockResolvedValue(mockPost);
    prisma.post.delete.mockResolvedValue(mockPost);
    const result = await service.remove('post-1');
    expect(result.id).toBe('post-1');
  });
});
