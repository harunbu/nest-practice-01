import { Injectable } from '@nestjs/common';

export type HealthStatus = {
  service: string;
  status: 'ok';
  timestamp: string;
};

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getHealth(): HealthStatus {
    return {
      service: 'api',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
