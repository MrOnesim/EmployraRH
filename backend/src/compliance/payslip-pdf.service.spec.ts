import { PayslipPdfService } from './payslip-pdf.service';
import { PayrollResult } from './compliance.interface';

describe('PayslipPdfService', () => {
  let service: PayslipPdfService;

  const mockResult: PayrollResult = {
    grossSalary: 5000,
    totalEmployeeContributions: 800,
    totalEmployerContributions: 1200,
    incomeTax: 500,
    netSocial: 4200,
    netPayable: 3700,
    contributions: [
      {
        code: 'URSSAF',
        label: 'URSSAF Maladie',
        employerAmount: 650,
        employeeAmount: 350,
        cap: null,
      },
      {
        code: 'RETRAITE',
        label: 'Retraite Complémentaire',
        employerAmount: 350,
        employeeAmount: 250,
        cap: 4000,
      },
    ],
    taxBracketsApplied: [
      { min: 0, max: 2000, rate: 0, amount: 0 },
      { min: 2000, max: 5000, rate: 0.11, amount: 330 },
      { min: 5000, max: null, rate: 0.3, amount: 170 },
    ],
    metadata: { countryCode: 'FR', rulesVersion: 1, effectiveDate: '2026-07-01' },
  };

  beforeEach(() => {
    service = new PayslipPdfService();
  });

  it('should generate a PDF stream for France', () => {
    const stream = service.generate(mockResult, 'FR', 7, 2026);

    expect(stream).toBeDefined();
    expect(stream.readable).toBe(true);
  });

  it('should generate a PDF stream for Benin', () => {
    const stream = service.generate(mockResult, 'BJ', 7, 2026);

    expect(stream).toBeDefined();
    expect(stream.readable).toBe(true);
  });

  it('should generate a PDF with employee info', () => {
    const stream = service.generate(mockResult, 'FR', 7, 2026, {
      firstName: 'Jean',
      lastName: 'Dupont',
      position: 'Développeur',
    });

    expect(stream).toBeDefined();
    expect(stream.readable).toBe(true);
  });

  it('should generate a PDF with company info', () => {
    const stream = service.generate(mockResult, 'FR', 7, 2026, undefined, {
      name: 'Tech Corp',
      address: 'Paris, France',
    });

    expect(stream).toBeDefined();
    expect(stream.readable).toBe(true);
  });

  it('should generate valid PDF bytes', () => {
    const chunks: Buffer[] = [];
    const stream = service.generate(mockResult, 'FR', 7, 2026);

    return new Promise<void>((done) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => {
        const pdf = Buffer.concat(chunks);
        expect(pdf.length).toBeGreaterThan(500);
        expect(pdf.slice(0, 5).toString()).toBe('%PDF-');
        done();
      });
    });
  });
});
