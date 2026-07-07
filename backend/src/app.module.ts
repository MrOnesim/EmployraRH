import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';
import { EmployeeModule } from './employee/employee.module';
import { LeaveModule } from './leave/leave.module';
import { AttendanceModule } from './attendance/attendance.module';
import { PayslipModule } from './payslip/payslip.module';
import { DocumentModule } from './document/document.module';
import { MeetingModule } from './meeting/meeting.module';
import { PayrollConfigModule } from './payroll-config/payroll-config.module';

@Module({
  imports: [PrismaModule, AuthModule, CompanyModule, EmployeeModule, LeaveModule, AttendanceModule, PayslipModule, DocumentModule, MeetingModule, PayrollConfigModule],
})
export class AppModule {}
