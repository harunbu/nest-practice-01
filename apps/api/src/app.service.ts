import { Injectable } from '@nestjs/common';
import type { HealthStatus } from '@repo/shared';

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
