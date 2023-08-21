import { Injectable } from '@nestjs/common';

const TOKEN_ADDRESS = 
""


@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
