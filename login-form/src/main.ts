import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Config Swagger
  const config = new DocumentBuilder()
    .setTitle('Login Form')
    .setDescription('Login Form API description')
    .setVersion('1.0')
    .addTag('Login Form')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  //Config Cors, cookies
  app.use(cookieParser());
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  await app.listen(8000);
}
bootstrap();
