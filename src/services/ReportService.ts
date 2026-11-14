import { Activity, OperationType } from '../models/Activity';
import { CategoryRepository } from '../repositories/CategoryRepository';

export interface ICategoryReportItem {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  percentage: number;
}

export interface ICategoryReport {
  items: ICategoryReportItem[];
  grandTotal: number;
}

export interface IDayReportItem {
  date: string;
  totalAmount: number;
}

export class ReportService {
  constructor(private categoryRepo: CategoryRepository) {}

  /** Звіт 1: за період, згруповано за категоріями */
  public generateCategoryReport(
    activities: Activity[],
    type: OperationType,
    startDate: string,
    endDate: string
  ): ICategoryReport {
    const filtered = activities.filter(
      (a) => a.type === type && a.date >= startDate && a.date <= endDate
    );

    const totalsByCategory = new Map<string, number>();
    let grandTotal = 0;

    for (const act of filtered) {
      totalsByCategory.set(act.categoryId, (totalsByCategory.get(act.categoryId) || 0) + act.amount);
      grandTotal += act.amount;
    }

    const items: ICategoryReportItem[] = [];
    totalsByCategory.forEach((sum, catId) => {
      const cat = this.categoryRepo.getById(catId);
      items.push({
        categoryId: catId,
        categoryName: cat ? cat.name : 'Видалена категорія',
        totalAmount: Number(sum.toFixed(2)),
        percentage: grandTotal > 0 ? Number(((sum / grandTotal) * 100).toFixed(1)) : 0
      });
    });

    items.sort((a, b) => b.totalAmount - a.totalAmount);
    return { items, grandTotal: Number(grandTotal.toFixed(2)) };
  }

  /** Звіт 2: день за днем */
  public generateDayByDayReport(
    activities: Activity[],
    type: OperationType,
    startDate: string,
    endDate: string
  ): IDayReportItem[] {
    const filtered = activities.filter(
      (a) => a.type === type && a.date >= startDate && a.date <= endDate
    );

    const totalsByDay = new Map<string, number>();
    for (const act of filtered) {
      totalsByDay.set(act.date, (totalsByDay.get(act.date) || 0) + act.amount);
    }

    const result: IDayReportItem[] = [];
    totalsByDay.forEach((total, date) => {
      result.push({ date, totalAmount: Number(total.toFixed(2)) });
    });
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }

  /** Звіт 3: помісячно (YYYY-MM) */
  public generateMonthlyReport(
    activities: Activity[],
    type: OperationType,
    startDate: string,
    endDate: string
  ): IDayReportItem[] {
    const byDay = this.generateDayByDayReport(activities, type, startDate, endDate);
    const totalsByMonth = new Map<string, number>();
    for (const d of byDay) {
      const month = d.date.slice(0, 7);
      totalsByMonth.set(month, (totalsByMonth.get(month) || 0) + d.totalAmount);
    }
    const result: IDayReportItem[] = [];
    totalsByMonth.forEach((total, date) => result.push({ date, totalAmount: Number(total.toFixed(2)) }));
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }
}
