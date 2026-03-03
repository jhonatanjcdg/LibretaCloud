import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ClientsModule } from './clients/clients.module';
import { CompaniesModule } from './companies/companies.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentsModule } from './payments/payments.module';
import { ProductsModule } from './products/products.module';
import { StockMovementsModule } from './stock-movements/stock-movements.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    ProductsModule,
    ClientsModule,
    InvoicesModule,
    CompaniesModule,
    CategoriesModule,
    StockMovementsModule,
    PaymentsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
