import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { MailService } from './mail/mail.service';
import Email from 'emails';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mailService: MailService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('send-email')
  async sendMail(
    @Body() sendMailDto: { email: string; subject: string },
  ): Promise<string> {
    await this.mailService.sendMail({
      ...sendMailDto,
      template: Email({ url: 'http://example.com' }),
    });

    return 'Email sent successfully';
  }
}
