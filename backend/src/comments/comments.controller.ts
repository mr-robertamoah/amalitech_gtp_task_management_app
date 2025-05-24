import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/users/interfaces/users.interface';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

//   @UseGuards(AuthGuard('jwt'))
//   @Get(':commentId')

//   async getComment(@Param('commentId') commentId: string, @GetUser() user: User) {
//     const comment = await this.commentsService.getComment(user, commentId);
//     if (!comment) {
//       throw new NotFoundException('Comment not found');
//     }
//     return comment;
//   }

  @UseGuards(AuthGuard('jwt'))
  @Get('projects/:projectId')
  async getProjectComments(
    @Param('projectId') projectId: string,
    @GetUser() user: User,
  ) {
    return await this.commentsService.getProjectComments(user, projectId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('tasks/:taskId')
  async getTaskComments(
    @Param('taskId') taskId: string,
    @GetUser() user: User,
  ) {
    return await this.commentsService.getTaskComments(user, taskId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('')
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @GetUser() owner: User,
  ) {
    return await this.commentsService.createComment(owner, createCommentDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':commentId')
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetUser() user: User,
  ) {
    const comment = await this.commentsService.updateComment(
      user,
      commentId,
      updateCommentDto,
    );

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':commentId')
  async deleteComment(
    @Param('commentId') commentId: string,
    @GetUser() user: User,
  ) {
    return await this.commentsService.deleteComment(user, commentId);
  }
}
