export type OperationType = 'Expense' | 'Revenue'; // "Витрата" | "Дохід"

export interface IActivityDto {
  id: string;
  categoryId: string;
  type: OperationType;
  amount: number;
  date: string; // YYYY-MM-DD
  description: string;
}

export class Activity {
  private _id: string;
  private _categoryId!: string;
  private _type: OperationType;
  private _amount!: number;
  private _date!: string;
  private _description: string;

  constructor(
    id: string,
    categoryId: string,
    type: OperationType,
    amount: number,
    date: string,
    description: string = ''
  ) {
    this._id = id;
    this.categoryId = categoryId;
    this._type = type;
    this.amount = amount;
    this.date = date;
    this._description = description.trim();
  }

  get id(): string {
    return this._id;
  }

  get categoryId(): string {
    return this._categoryId;
  }

  set categoryId(val: string) {
    if (!val) throw new Error("Категорія є обов'язковою для транзакції.");
    this._categoryId = val;
  }

  get type(): OperationType {
    return this._type;
  }

  set type(val: OperationType) {
    this._type = val;
  }

  get amount(): number {
    return this._amount;
  }

  set amount(val: number) {
    if (isNaN(val) || val <= 0) {
      throw new Error('Сума операції має бути додатним числом більше за 0.');
    }
    this._amount = Number(val.toFixed(2));
  }

  get date(): string {
    return this._date;
  }

  set date(val: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      throw new Error('Некоректний формат дати. Очікується YYYY-MM-DD.');
    }
    this._date = val;
  }

  get description(): string {
    return this._description;
  }

  set description(val: string) {
    this._description = val.trim();
  }

  public toJSON(): IActivityDto {
    return {
      id: this._id,
      categoryId: this._categoryId,
      type: this._type,
      amount: this._amount,
      date: this._date,
      description: this._description
    };
  }

  public static fromJSON(dto: IActivityDto): Activity {
    return new Activity(dto.id, dto.categoryId, dto.type, dto.amount, dto.date, dto.description);
  }
}
