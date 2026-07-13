import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateFinanceEntryDto, UpdateFinanceEntryDto } from './finance.dto';
import { InvoiceService } from './invoice.service';

class SendInvoiceDto {
  type: 'hub' | 'student' | 'kcp' | 'it';
  id: string;
}

@Controller('finance')
export class FinanceController {
  constructor(private readonly service: FinanceService, private readonly invoiceService: InvoiceService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() create(@Body() dto: CreateFinanceEntryDto) { return this.service.create(dto); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateFinanceEntryDto) {
    return this.service.update(id, dto);
  }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }

  @Post('send-invoice')
  sendInvoice(@Body() dto: SendInvoiceDto) {
    return this.invoiceService.sendInvoiceFor(dto.type, dto.id);
  }
}
