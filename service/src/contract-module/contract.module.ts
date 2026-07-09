import { Global, Module } from '@nestjs/common';
import { TestService } from 'src/user-module/services/test.service';
import { UserModule } from 'src/user-module/user.module';

@Global()
@Module({
  imports: [UserModule],
  controllers: [],
  providers: [{ provide: ITestServiceContract, useClass: TestService }],
  exports: [ITestServiceContract],
})
export class ContractModule {}
