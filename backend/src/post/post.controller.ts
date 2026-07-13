import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ParseCuidPipe } from '../common/pipes/parse-cuid.pipe';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('posts')
@ApiBearerAuth()
@Controller('posts')
@UseGuards(RolesGuard)
export class PostController {
  constructor(private service: PostService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  create(@Body() dto: CreatePostDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get posts by company' })
  findByCompany(@Query('companyId') companyId: string) {
    return this.service.findByCompany(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID' })
  findById(@Param('id', ParseCuidPipe) id: string) {
    return this.service.findById(id);
  }

  @Post(':id/like')
  @ApiOperation({ summary: 'Toggle like on a post' })
  toggleLike(@Param('id', ParseCuidPipe) id: string, @Body('employeeId') employeeId: string) {
    return this.service.toggleLike(id, employeeId);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add a comment to a post' })
  addComment(@Param('id', ParseCuidPipe) id: string, @Body() dto: CreateCommentDto) {
    return this.service.addComment(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post' })
  remove(@Param('id', ParseCuidPipe) id: string) {
    return this.service.remove(id);
  }
}
