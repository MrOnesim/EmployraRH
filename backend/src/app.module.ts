import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
import { NotificationModule } from './notification/notification.module';
import { CalendarEventModule } from './calendar-event/calendar-event.module';
import { ConversationModule } from './conversation/conversation.module';
import { BankAccountModule } from './bank-account/bank-account.module';
import { BankTransactionModule } from './bank-transaction/bank-transaction.module';
import { SalaryAdvanceModule } from './salary-advance/salary-advance.module';
import { SalaryTransferModule } from './salary-transfer/salary-transfer.module';
import { SignatureRequestModule } from './signature-request/signature-request.module';
import { SignatureTemplateModule } from './signature-template/signature-template.module';
import { CourseModule } from './course/course.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { QuizModule } from './quiz/quiz.module';
import { QuizAttemptModule } from './quiz-attempt/quiz-attempt.module';
import { CertificateModule } from './certificate/certificate.module';
import { JobOfferModule } from './job-offer/job-offer.module';
import { CandidateModule } from './candidate/candidate.module';
import { ObjectiveModule } from './objective/objective.module';
import { PerformanceReviewModule } from './performance-review/performance-review.module';
import { EquipmentModule } from './equipment/equipment.module';
import { EquipmentAssignmentModule } from './equipment-assignment/equipment-assignment.module';
import { WellnessSurveyModule } from './wellness-survey/wellness-survey.module';
import { WellnessResponseModule } from './wellness-response/wellness-response.module';
import { MissionModule } from './mission/mission.module';
import { ExpenseReportModule } from './expense-report/expense-report.module';
import { TaxDeclarationModule } from './tax-declaration/tax-declaration.module';
import { SecurityGuardModule } from './security-guard/security-guard.module';
import { QrTokenModule } from './qr-token/qr-token.module';
import { TerminalModule } from './terminal/terminal.module';
import { InvitationModule } from './invitation/invitation.module';
import { HealthController } from './health.controller';
import { AuthGuard } from './common/guards/auth.guard';
import { ThrottlerBehindProxyGuard } from './common/throttler-behind-proxy.guard';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    PrismaModule, AuthModule, CompanyModule, EmployeeModule, LeaveModule, AttendanceModule, PayslipModule, DocumentModule, MeetingModule, PayrollConfigModule, NotificationModule, CalendarEventModule, ConversationModule, BankAccountModule, BankTransactionModule, SalaryAdvanceModule, SalaryTransferModule, SignatureRequestModule, SignatureTemplateModule, CourseModule, EnrollmentModule, QuizModule, QuizAttemptModule, CertificateModule, JobOfferModule, CandidateModule, ObjectiveModule, PerformanceReviewModule, EquipmentModule, EquipmentAssignmentModule, WellnessSurveyModule, WellnessResponseModule, MissionModule, ExpenseReportModule, TaxDeclarationModule, SecurityGuardModule, QrTokenModule, TerminalModule, InvitationModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerBehindProxyGuard },
  ],
})
export class AppModule {}
