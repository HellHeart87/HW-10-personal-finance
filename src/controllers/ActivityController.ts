import { Activity, OperationType } from '../models/Activity';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { ActivityRepository } from '../repositories/ActivityRepository';
import { $, escapeHtml, todayISO } from '../utils/dom';

export class ActivityController {
  private modal: BootstrapModal;

  constructor(
    private categoryRepo: CategoryRepository,
    private activityRepo: ActivityRepository
  ) {
    this.modal = new bootstrap.Modal($('activityModal'));
    this.populateCategoryDropdowns();
    this.bindEvents();
    this.render();
  }

  /** Викликається також ззовні, коли змінюється список категорій */
  public populateCategoryDropdowns(): void {
    const filterCat = $<HTMLSelectElement>('filter-activity-category');
    const modalCat = $<HTMLSelectElement>('activity-category-select');
    const prevFilter = filterCat.value;

    filterCat.innerHTML = '<option value="">&lt;Всі категорії&gt;</option>';
    modalCat.innerHTML = '';

    this.categoryRepo.getAll().forEach((c) => {
      const option = `<option value="${escapeHtml(c.id)}">${escapeHtml(c.name)}</option>`;
      filterCat.insertAdjacentHTML('beforeend', option);
      modalCat.insertAdjacentHTML('beforeend', option);
    });

    filterCat.value = prevFilter;
  }

  private bindEvents(): void {
    const filterCat = $<HTMLSelectElement>('filter-activity-category');
    const filterType = $<HTMLSelectElement>('filter-activity-type');

    const applyFilter = () => {
      const catId = filterCat.value || undefined;
      const type = (filterType.value as OperationType) || undefined;
      this.render(this.activityRepo.filter(catId, type));
    };

    filterCat.addEventListener('change', applyFilter);
    filterType.addEventListener('change', applyFilter);

    $('btn-reset-filters').addEventListener('click', () => {
      filterCat.value = '';
      filterType.value = '';
      this.render();
    });

    $('btn-open-activity-modal').addEventListener('click', () => {
      $<HTMLFormElement>('activity-form').reset();
      $<HTMLInputElement>('activity-id-input').value = '';
      $<HTMLInputElement>('activity-date-input').value = todayISO();
      $('activityModalTitle').textContent = 'Реєстрація інформації про транзакцію';
      this.modal.show();
    });

    $<HTMLFormElement>('activity-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const id = $<HTMLInputElement>('activity-id-input').value || `act-${Date.now()}`;
      const catId = $<HTMLSelectElement>('activity-category-select').value;
      const type = $<HTMLSelectElement>('activity-type-select').value as OperationType;
      const amount = parseFloat($<HTMLInputElement>('activity-amount-input').value);
      const date = $<HTMLInputElement>('activity-date-input').value;
      const desc = $<HTMLInputElement>('activity-desc-input').value;

      try {
        this.activityRepo.save(new Activity(id, catId, type, amount, date, desc));
        this.modal.hide();
        this.render();
      } catch (err) {
        alert((err as Error).message);
      }
    });
  }

  public render(list: Activity[] = this.activityRepo.getAll()): void {
    const tbody = $('activities-table-body');
    tbody.innerHTML = '';

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">Транзакцій не знайдено</td></tr>`;
      return;
    }

    list.forEach((act, index) => {
      const cat = this.categoryRepo.getById(act.categoryId);
      const catName = cat ? cat.name : 'Невідома категорія';
      const isExpense = act.type === 'Expense';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td><span class="badge bg-secondary">${escapeHtml(catName)}</span></td>
        <td><span class="badge ${isExpense ? 'bg-danger' : 'bg-success'}">${isExpense ? 'Витрата' : 'Дохід'}</span></td>
        <td class="fw-bold ${isExpense ? 'text-danger' : 'text-success'}">${isExpense ? '-' : '+'}${act.amount.toFixed(2)}</td>
        <td>${act.date}</td>
        <td>${act.description ? escapeHtml(act.description) : '—'}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-secondary me-1 edit-act-btn"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-outline-danger del-act-btn"><i class="bi bi-x-lg"></i></button>
        </td>`;
      tr.querySelector('.edit-act-btn')!.addEventListener('click', () => this.edit(act.id));
      tr.querySelector('.del-act-btn')!.addEventListener('click', () => this.remove(act.id));
      tbody.appendChild(tr);
    });
  }

  private edit(id: string): void {
    const act = this.activityRepo.getById(id);
    if (!act) return;
    $<HTMLInputElement>('activity-id-input').value = act.id;
    $<HTMLSelectElement>('activity-category-select').value = act.categoryId;
    $<HTMLSelectElement>('activity-type-select').value = act.type;
    $<HTMLInputElement>('activity-amount-input').value = act.amount.toString();
    $<HTMLInputElement>('activity-date-input').value = act.date;
    $<HTMLInputElement>('activity-desc-input').value = act.description;
    $('activityModalTitle').textContent = 'Редагування інформації про транзакцію';
    this.modal.show();
  }

  private remove(id: string): void {
    if (confirm('Видалити цю транзакцію?')) {
      this.activityRepo.delete(id);
      this.render();
    }
  }
}
