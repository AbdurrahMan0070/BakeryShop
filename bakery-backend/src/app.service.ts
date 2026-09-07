import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      status: 'ok',
      message: '🍞 Bakery Shop Backend API is running successfully!',
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: '/auth (register, login, me)',
        products: '/products',
        categories: '/categories',
        sales: '/sales',
        dashboard: '/dashboard',
        reports: '/reports',
        settings: '/settings',
        notifications: '/notifications',
      },
    };
  }
}

