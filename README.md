# Sending Emails with React email and Nodemailer in NestJs.

Before now backend developers only had the option of designing email templates with template engines such as handlebars, pug, ejs etc. But for backend developers that are used to react, the release of react-email might have been the best news for them, because of the flexibility and access to most of the features of react.
This post gets you up and running with everything you need to know about sending emails using react email and nodemailer in your NestJS backend. 👇

## Installation

Refer to the official docs of NestJs [here](https://docs.nestjs.com/#installation).
Open your terminal and run the following command to setup a new nestjs project

```bash
nest new nest-and-react-email
cd nest-and-react-email
```

**Note**: The react-email package currently has an incompatible package with our project so we need to provide a resolution for those packages. Open the package.json file and add the following

```js
{
  // ...

  "resolutions": {
    "wrap-ansi": "7.0.0",
    "string-width": "4.1.0"
  }
}
```

The next step is to install react-email and nodemailer manually

```bash
yarn add react-email @react-email/components -E
yarn add nodemailer @react-email/render
yarn add -D @types/nodemailer
```

## Setup React Emails

Include the following script in your package.json file, we will be setting up our email server on port **3001** to avoid clash with the NestJs server which is running on react-email default port 3000.

```json
{
  "scripts": {
    "email:dev": "email dev -p 3001"
  }
}
```

At the root of your project, create a new folder called emails, then create a file inside called **index.tsx**, and add the following code:

```tsx
import { Button, Html } from '@react-email/components';
import * as React from 'react';

export default function Email({ url }) {
  return (
    <Html>
      <Button
        href={url}
        style={{ background: '#000', color: '#fff', padding: '12px 20px' }}
      >
        Click me
      </Button>
    </Html>
  );
}
```

**Note**: If you get some typescript error, add the following to your tsconfig.json to clear the error.

```js
{
  "compilerOptions": {
    "jsx": "react"
    // ...
  }
}
```

<br /><br />

To start reat email development server, run the following in your terminal.

```bash
yarn email:dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to view react-email page.<br/>
**Note:** The first time you run this command, react email installs a couple more packages so it might take some time to setup the server.

## Setup Nodemailer and the Mail Module

To setup our mail module, run the following commands in your terminal

```bash
nest g module mail
nest g service mail
```

Open the mail/mail.module.ts, then add the following to export our MailService

```ts
@Module({
  // ...
  exports: [MailService],
})
```

Open the mail/mail.service.ts file and replace with the following content

```ts
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
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'replace_with_your_email',
          pass: 'replace_with_your_email_password',
        },
      },
      {
        from: {
          name: 'NestJs + React Emails Test App',
          address: 'Test App',
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
      html,
    });
  }
}
```

**Note**: Replace the email and password credentials in the transporter configuration.<br />

Lets go through the file above to understand what is going on.<br/>
Firstly, on initialization of the mail service the nodemailer transporter is initialized which primarily send out our emails, then the generate email function which renders the react-email component passed to the service to an html format understandable by the node transporter. The lastly our sendMail function whcih can be called anywhere outside the service to send emails based on the parameters provided.<br>

## Using our mail service

Open app.controller.ts and add replace with the following

```ts
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
```

We are all set to send our first email with react-email and nodemailer.<br />
Open your terminal and run the following command to start the nestjs server

```bash
yarn start:dev
```

To test our endpoint, open Postman or any similar agent, then send a request to _http://localhost:3000/send-email_.
You have have something like below.
![Sample Request](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/bgh72b2zhair1uascbi1.png)
