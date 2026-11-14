import { Category } from '../models/Category';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { ActivityRepository } from '../repositories/ActivityRepository';
import { $, escapeHtml } from '../utils/dom';

export class CategoryController {
  private modal: BootstrapModal;

  constructor(
    private categoryRepo: CategoryRepository,
    private activityRepo: ActivityRepository,
    private onChange: () => void
  ) {
    this.modal = new bootstrap.Modal($('categoryModal'));
    this.bindEvents();
    this.render();
  }

  private bindEvents(): void {
    const searchInput = $<HTMLInputElement>('search-category-input');
    searchInput.addEventListener('input', () => {
      this.render(this.categoryRepo.searchByName(searchInput.value));
    });

    $('btn-open-category-modal').addEventListener('click', () => {
      $<HTMLFormElement>('category-form').reset();
      $<HTMLInputElement>('category-id-input').value = '';
      $('categoryModalTitle').textContent = 'Реєстрація інформації про категорію';
      this.modal.show();
    });

    $<HTMLFormElement>('category-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const id = $<HTMLInputElement>('category-id-input').value || `cat-${Date.now()}`;
      const name = $<HTMLInputElement>('category-name-input').value;
      const desc = $<HTMLTextAreaElement>('category-desc-input').value;

      try {
        this.categoryRepo.save(new Category(id, name, desc));
        this.modal.hide();
        this.render();
        this.onChange();
      } catch (err) {
        alert((err as Error).message);
      }
    });
  }

  public render(list: Category[] = this.categoryRepo.getAll()): void {
    const tbody = $('categories-table-body');
    tbody.innerHTML = '';

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Категорій не знайдено</td></tr>`;
      return;
    }

    list.forEach((cat, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td class="fw-bold">${escapeHtml(cat.name)}</td>
        <td>${cat.description ? escapeHtml(cat.description) : '<span class="text-muted">—</span>'}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-secondary me-1 edit-cat-btn"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-outline-danger del-cat-btn"><i class="bi bi-x-lg"></i></button>
        </td>`;
      tr.querySelector('.edit-cat-btn')!.addEventListener('click', () => this.edit(cat.id));
      tr.querySelector('.del-cat-btn')!.addEventListener('click', () => this.remove(cat.id));
      tbody.appendChild(tr);
    });
  }

  private edit(id: string): void {
    const cat = this.categoryRepo.getById(id);
    if (!cat) return;
    $<HTMLInputElement>('category-id-input').value = cat.id;
    $<HTMLInputElement>('category-name-input').value = cat.name;
    $<HTMLTextAreaElement>('category-desc-input').value = cat.description;
    $('categoryModalTitle').textContent = 'Редагування інформації про категорію';
    this.modal.show();
  }

  private remove(id: string): void {
    const used = this.activityRepo.countByCategory(id);
    if (used > 0) {
      alert(`Неможливо видалити категорію: за нею закріплено транзакцій — ${used}. Спочатку видаліть або змініть їх.`);
      return;
    }
    if (confirm('Видалити цю категорію?')) {
      this.categoryRepo.delete(id);
      this.render();
      this.onChange();
    }
  }
}
