import { Injectable } from '@nestjs/common';
import { render } from '@react-email/render';
import * as nodemailer from 'nodemailer';

interface SendMailConfiguration {
  email: string;
  subject: string;
  text?: string;
  template: any;
}

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport(
      {
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT) || 0,
        secure: process.env.MAILER_SECURE === 'true',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
      },
      {
        from: {
          name: process.env.MAIL_FROM_NAME,
          address: process.env.MAIL_FROM_ADDRESS,
        },
      },
    );
  }

  private generateEmail = (template) => {
    return render(template);
  };

  async sendMail({ email, subject, template }: SendMailConfiguration) {
    const html = this.generateEmail(template);

    await this.transporter.sendMail({
      to: email,
      subject,
      html: html,
    });

    return { message: 'Email sent successfully' };
  }
}
