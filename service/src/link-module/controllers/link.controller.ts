import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { Admin } from 'src/common/decorators/admin.decorator';
import { LinkService } from '../services/link.service';
import { LinkCreateDto } from '../dto/request/link-create.dto';
import { LinkUpdateDto } from '../dto/request/link-update.dto';
import { LinkDto } from '../dto/response/link.dto';

@Controller('Links')
export class LinkController {
  constructor(private readonly linkService: LinkService) {}

  @Public()
  @Get()
  linkGetMany(): Promise<LinkDto[]> {
    return this.linkService.linkGetMany();
  }

  @Admin()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  linkCreate(@Body() payload: LinkCreateDto): Promise<number> {
    return this.linkService.linkCreate(payload);
  }

  @Admin()
  @Patch(':linkId')
  linkUpdate(
    @Param('linkId', ParseIntPipe) id: number,
    @Body() payload: LinkUpdateDto,
  ): Promise<void> {
    return this.linkService.linkUpdate(id, payload);
  }

  @Admin()
  @Delete(':linkId')
  @HttpCode(HttpStatus.NO_CONTENT)
  linkDelete(@Param('linkId', ParseIntPipe) id: number): Promise<void> {
    return this.linkService.linkDelete(id);
  }
}