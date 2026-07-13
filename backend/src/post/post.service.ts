import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async findByCompany(companyId: string) {
    return this.prisma.post.findMany({
      where: { companyId },
      include: { comments: { orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { comments: { orderBy: { createdAt: 'asc' } } },
    });
    if (!post) throw new NotFoundException(`Post with id "${id}" not found`);
    return post;
  }

  async create(data: { companyId: string; authorId: string; authorName: string; content: string }) {
    if (!data.content || !data.content.trim()) throw new BadRequestException('Content is required');
    return this.prisma.post.create({
      data: {
        companyId: data.companyId,
        authorId: data.authorId,
        authorName: data.authorName,
        content: data.content,
      },
      include: { comments: true },
    });
  }

  async toggleLike(id: string, employeeId: string) {
    const post = await this.findById(id);
    const liked = post.likes.includes(employeeId);
    const likes = liked ? post.likes.filter((l) => l !== employeeId) : [...post.likes, employeeId];
    return this.prisma.post.update({
      where: { id },
      data: { likes },
      include: { comments: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async addComment(id: string, data: { authorId: string; authorName: string; content: string }) {
    if (!data.content || !data.content.trim()) throw new BadRequestException('Content is required');
    await this.findById(id);
    await this.prisma.postComment.create({
      data: {
        postId: id,
        authorId: data.authorId,
        authorName: data.authorName,
        content: data.content,
      },
    });
    return this.findById(id);
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.post.delete({ where: { id } });
  }
}
