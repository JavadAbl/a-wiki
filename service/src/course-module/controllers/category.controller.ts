import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { GetManyQuery, GetManyQueryType } from 'src/common/dto/request/get-many-query';
import { GetManyReply } from 'src/common/dto/response/get-many-reply';
import { CategoryCreateDto } from '../dto/request/category-create.dto';
import { CategoryService } from '../services/category.service';
import { Public } from 'src/common/decorators/public.decorator';
import { CategoryDto } from '../dto/response/category.dto';
import { CategoryUpdateDto } from '../dto/request/category-update.dto';

@Controller('Categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Public()
  @Get()
  categoryGetMany(@Query() query: GetManyQuery): Promise<GetManyReply<CategoryDto>> {
    return this.categoryService.categoryGetMany(query as GetManyQueryType<'Category'>);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  categoryCreate(@Body() payload: CategoryCreateDto): Promise<number> {
    return this.categoryService.categoryCreate(payload);
  }

  @Patch(':categoryId')
  courseUpdate(
    @Param('categoryId', ParseIntPipe) id: number,
    @Body() payload: CategoryUpdateDto,
  ): Promise<void> {
    return this.categoryService.categoryUpdate(id, payload);
  }

  @Delete(':categoryId')
  @HttpCode(HttpStatus.NO_CONTENT)
  courseDelete(@Param('categoryId', ParseIntPipe) id: number): Promise<void> {
    return this.categoryService.categoryDelete(id);
  }
}
