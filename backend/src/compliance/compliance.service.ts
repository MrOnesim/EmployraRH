import { Injectable, Logger } from '@nestjs/common';
import { CountryProviderRegistry } from './providers/provider.registry';
import { PayrollInput, PayrollResult } from './compliance.interface';

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  constructor(private readonly registry: CountryProviderRegistry) {}

  async calculatePayslip(
    employeeId: string,
    month: number,
    year: number,
    grossSalary: number,
    countryCode: string,
  ): Promise<{ result: PayrollResult; countryCode: string }> {
    const provider = this.registry.getProvider(countryCode);
    const period = new Date(year, month - 1, 1);

    const result = await provider.calculatePayroll({
      grossSalary,
      countryCode,
      employeeId,
      period,
    });

    this.logger.log(
      `Payslip calculated for ${countryCode}: gross=${grossSalary} net=${result.netPayable}`,
    );

    return { result, countryCode };
  }

  async getLeaveEntitlements(countryCode: string, hireDate: Date) {
    const provider = this.registry.getProvider(countryCode);
    return provider.getLeaveEntitlements(hireDate);
  }

  async getPublicHolidays(countryCode: string, year: number) {
    const provider = this.registry.getProvider(countryCode);
    return provider.getPublicHolidays(year);
  }

  getSupportedCountries(): string[] {
    return this.registry.getSupportedCountries();
  }
}
