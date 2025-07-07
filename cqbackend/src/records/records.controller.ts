import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { RecordsService } from './records.service';
import { dnsRecordType } from '../db/schema/records.schema';
// Infer the enum type
type RecordType = (typeof dnsRecordType.enumValues)[number];
@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Get()
  async findAll() {
    return this.recordsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.recordsService.findOne(Number(id));
  }

  @Post()
async create(
    @Body()
    body: {
      domainId: number;
      name: string;
      type: RecordType; // ✅ use enum type here, NOT string
      value: string;
      ttl: number;
      priority?: number;
    },
  ) {
    return this.recordsService.create(body);
  }


  @Put(':id')
  async update(@Param('id') id: string, @Body() body: { name?: string }) {
    return this.recordsService.update(Number(id), body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.recordsService.remove(Number(id));
  }
}