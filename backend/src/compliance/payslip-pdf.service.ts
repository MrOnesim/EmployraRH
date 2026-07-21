import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { PayrollResult } from './compliance.interface';
import { PassThrough } from 'stream';

const CURRENCY_SYMBOLS: Record<string, string> = {
  FR: '\u20AC',
  BJ: 'CFA',
  CI: 'CFA',
  SN: 'CFA',
};

const COUNTRY_NAMES: Record<string, string> = {
  FR: 'France',
  BJ: 'B\u00e9nin',
  CI: "C\u00f4te d'Ivoire",
  SN: 'S\u00e9n\u00e9gal',
};

@Injectable()
export class PayslipPdfService {
  generate(
    result: PayrollResult,
    countryCode: string,
    month: number,
    year: number,
    employee?: { firstName: string; lastName: string; position?: string },
    company?: { name: string; address?: string },
  ): PassThrough {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = new PassThrough();
    doc.pipe(stream);

    const currency = CURRENCY_SYMBOLS[countryCode] ?? '';
    const countryName = COUNTRY_NAMES[countryCode] ?? countryCode;
    const fmt = (v: number) => `${v.toLocaleString('fr-FR')} ${currency}`;
    const monthName = new Date(year, month - 1).toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });

    // ── Header ──
    doc.fontSize(18).font('Helvetica-Bold').text('BULLETIN DE PAIE', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica').text(`P\u00e9riode : ${monthName}`, { align: 'center' });
    doc.text(`Pays : ${countryName} (${countryCode})`, { align: 'center' });
    doc.moveDown(1);

    // ── Divider ──
    this.drawDivider(doc, 50, doc.y, 545, 0.5);

    // ── Company / Employee ──
    const leftX = 50;
    const rightX = 320;
    let leftY = doc.y + 10;
    let rightY = leftY;

    doc.fontSize(11).font('Helvetica-Bold');
    if (company?.name) {
      doc.text(company.name, leftX, leftY);
      leftY += 15;
      doc.fontSize(9).font('Helvetica');
      if (company.address) {
        doc.text(company.address, leftX, leftY);
        leftY += 12;
      }
    } else {
      doc.text('Entreprise', leftX, leftY);
      leftY += 15;
    }

    doc.fontSize(11).font('Helvetica-Bold');
    if (employee) {
      doc.text(`${employee.firstName} ${employee.lastName}`, rightX, rightY);
      rightY += 15;
      doc.fontSize(9).font('Helvetica');
      if (employee.position) {
        doc.text(employee.position, rightX, rightY);
        rightY += 12;
      }
    } else {
      doc.text('Salari\u00e9 (simulation)', rightX, rightY);
      rightY += 15;
    }

    doc.y = Math.max(leftY, rightY) + 15;

    // ── Salaires ──
    this.drawSection(doc, 'SALAIRE', 50);
    this.drawRow(doc, 50, 'Salaire brut', fmt(result.grossSalary));
    this.drawRow(doc, 50, 'Charges patronales', fmt(result.totalEmployerContributions));
    doc.moveDown(0.5);

    // ── Cotisations salariales ──
    this.drawSection(doc, 'COTISATIONS SALARIALES', 50);
    for (const c of result.contributions) {
      if (c.employeeAmount > 0) {
        const label = c.cap ? `${c.label} (plaf. ${fmt(c.cap)})` : c.label;
        this.drawRow(doc, 50, label, `- ${fmt(c.employeeAmount)}`);
      }
    }
    this.drawRow(
      doc,
      50,
      'Total cotisations salariales',
      `-${fmt(result.totalEmployeeContributions)}`,
    );
    doc.moveDown(0.5);

    // ── Impot sur le revenu ──
    if (result.incomeTax > 0) {
      this.drawSection(doc, 'IMP\u00d4T SUR LE REVENU', 50);
      for (const b of result.taxBracketsApplied) {
        if (b.amount > 0) {
          const bracketLabel = b.max
            ? `${fmt(b.min)} \u2013 ${fmt(b.max)} @ ${(b.rate * 100).toFixed(1)}%`
            : `${fmt(b.min)}+ @ ${(b.rate * 100).toFixed(1)}%`;
          this.drawRow(doc, 50, bracketLabel, `- ${fmt(b.amount)}`);
        }
      }
      this.drawRow(doc, 50, 'Imp\u00f4t total', `-${fmt(result.incomeTax)}`);
      doc.moveDown(0.5);
    }

    // ── Divider avant net ──
    this.drawDivider(doc, 50, doc.y, 545, 1);
    doc.moveDown(0.5);

    // ── Salaire net ──
    this.drawSection(doc, 'R\u00c9CAPITULATIF', 50);
    this.drawRow(doc, 50, 'Salaire brut', fmt(result.grossSalary));
    this.drawRow(doc, 50, '- Cotisations salariales', `-${fmt(result.totalEmployeeContributions)}`);
    if (result.incomeTax > 0) {
      this.drawRow(doc, 50, '- Imp\u00f4t sur le revenu', `-${fmt(result.incomeTax)}`);
    }
    this.drawDivider(doc, 50, doc.y + 2, 545, 0.5);
    this.drawRow(doc, 50, 'SALAIRE NET \u00c0 PAYER', fmt(result.netPayable), true);

    // ── Footer ──
    doc.moveDown(2);
    doc
      .fontSize(7)
      .font('Helvetica')
      .text(
        `G\u00e9n\u00e9r\u00e9 le ${new Date().toLocaleDateString('fr-FR')} \u2014 R\u00e8gles : ${countryName} v${result.metadata.rulesVersion} (${result.metadata.effectiveDate})`,
        50,
        doc.y,
        { align: 'center' },
      );

    doc.end();
    return stream;
  }

  private drawSection(doc: PDFKit.PDFDocument, title: string, x: number) {
    doc.fontSize(11).font('Helvetica-Bold').text(title, x);
    doc.moveDown(0.3);
    this.drawDivider(doc, x, doc.y, 495, 0.3);
    doc.moveDown(0.3);
  }

  private drawRow(doc: PDFKit.PDFDocument, x: number, label: string, value: string, bold = false) {
    const font = bold ? 'Helvetica-Bold' : 'Helvetica';
    doc.fontSize(9).font(font).text(label, x, doc.y, { continued: true });
    doc.text(`  ${value}`, { align: 'right' });
    doc.moveDown(0.15);
  }

  private drawDivider(
    doc: PDFKit.PDFDocument,
    x1: number,
    y: number,
    x2: number,
    thickness: number,
  ) {
    doc.save();
    doc.moveTo(x1, y).lineTo(x2, y).lineWidth(thickness).stroke('#999999');
    doc.restore();
  }
}
