import { OperationType } from '../models/Activity';
import { ActivityRepository } from '../repositories/ActivityRepository';
import { ICategoryReport, IDayReportItem, ReportService } from '../services/ReportService';
import { $, escapeHtml, todayISO } from '../utils/dom';

export class ReportController {
  constructor(
    private activityRepo: ActivityRepository,
    private reportService: ReportService
  ) {
    this.setDefaultDates();
    this.bindEvents();
  }

  private setDefaultDates(): void {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    $<HTMLInputElement>('report-start-date').value = startDate.toISOString().split('T')[0];
    $<HTMLInputElement>('report-end-date').value = todayISO();
  }

  private bindEvents(): void {
    $<HTMLFormElement>('report-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const start = $<HTMLInputElement>('report-start-date').value;
      const end = $<HTMLInputElement>('report-end-date').value;
      const type = $<HTMLSelectElement>('report-type').value as OperationType;

      if (start > end) {
        alert('Початкова дата не може бути пізніше за кінцеву.');
        return;
      }

      const all = this.activityRepo.getAll();
      this.render(
        this.reportService.generateCategoryReport(all, type, start, end),
        this.reportService.generateDayByDayReport(all, type, start, end),
        start,
        end,
        type
      );
    });
  }

  private render(
    catReport: ICategoryReport,
    daysReport: IDayReportItem[],
    start: string,
    end: string,
    type: OperationType
  ): void {
    $('report-result-container').classList.remove('d-none');
    $('report-header-text').textContent =
      `Звіт за період: ${start} — ${end} (${type === 'Expense' ? 'Витрати' : 'Доходи'})`;

    const tbody = $('report-table-body');
    tbody.innerHTML = '';
    if (catReport.items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted">За обраний період операцій не знайдено</td></tr>`;
    } else {
      catReport.items.forEach((item) => {
        tbody.insertAdjacentHTML('beforeend', `
          <tr>
            <td>${escapeHtml(item.categoryName)}</td>
            <td class="text-end fw-bold">${item.totalAmount.toFixed(2)}</td>
            <td class="text-end">${item.percentage}%</td>
          </tr>`);
      });
    }
    $('report-grand-total').textContent = `${catReport.grandTotal.toFixed(2)} грн`;

    const daysList = $('report-days-list');
    daysList.innerHTML = '';
    if (daysReport.length === 0) {
      daysList.innerHTML = `<li class="list-group-item text-muted text-center">Немає записів</li>`;
    } else {
      daysReport.forEach((d) => {
        daysList.insertAdjacentHTML('beforeend', `
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <span><i class="bi bi-calendar3 me-2 text-primary"></i>${d.date}</span>
            <span class="badge bg-primary rounded-pill">${d.totalAmount.toFixed(2)} грн</span>
          </li>`);
      });
    }
  }
}
