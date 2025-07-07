import { Module } from '@nestjs/common';
import { DomainsController } from './Domains.controller';
import { DomainsService } from './Domains.service';

@Module({
  controllers: [DomainsController],
  providers: [DomainsService]
})
export class DomainsModule {}