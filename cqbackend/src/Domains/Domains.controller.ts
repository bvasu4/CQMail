import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { DomainsService } from './Domains.service';

@Controller('domains')
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  @Get()
  findAll() {
    return this.domainsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.domainsService.findOne(Number(id));
  }

  @Post()
  create(@Body() body: { name: string , registeredAt?: string, isConfigured?: boolean }) {
    return this.domainsService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: { name?: string  , registeredAt?: string, isConfigured?: boolean }) {
    return this.domainsService.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.domainsService.remove(Number(id));
  }
}