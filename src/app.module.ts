import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { ClientsModule } from './clients/clients.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        type: 'mysql' as const,
        host: c.getOrThrow<string>('DB_HOST'),
        port: Number(c.getOrThrow<string>('DB_PORT')),
        username: c.getOrThrow<string>('DB_USERNAME'),
        password: c.getOrThrow<string>('DB_PASSWORD'),
        database: c.getOrThrow<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true, // TP uniquement
      }),
    }),
    CategoriesModule,
    ProductsModule,
    ClientsModule,
    OrdersModule,
  ],
})
export class AppModule {}