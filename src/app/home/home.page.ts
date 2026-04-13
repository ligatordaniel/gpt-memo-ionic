import { Component } from '@angular/core';

type AppMode = 'gtd' | 'shopping' | 'finance';
type GtdStage = 'inbox' | 'next' | 'waiting' | 'scheduled' | 'someday' | 'done';
type TaskCategoryId = string;

interface TaskCategory {
  id: TaskCategoryId;
  label: string;
  color: string;
  icon: string;
}

interface TaskItem {
  id: string;
  title: string;
  notes: string;
  stage: GtdStage;
  categoryId: TaskCategoryId;
  createdAt: string;
  updatedAt: string;
}

interface TaskDraft {
  title: string;
  notes: string;
  categoryId: TaskCategoryId;
  stage: GtdStage;
}

interface CategoryDraft {
  label: string;
  color: string;
  icon: string;
}

interface CategoryView {
  id: 'all' | TaskCategoryId;
  label: string;
  color: string;
}

interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  checked: boolean;
}

interface ShoppingDraft {
  name: string;
  quantity: number;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  private readonly storageKey = 'gtd.memo.tasks.v1';
  private readonly categoryStorageKey = 'gtd.memo.categories.v1';
  private readonly shoppingStorageKey = 'gtd.memo.shopping.v1';
  private readonly financeStorageKey = 'gtd.memo.finance.v1';
  private readonly themeStorageKey = 'gtd.memo.theme.v1';
  private touchStartX = 0;
  private touchStartY = 0;

  categories: TaskCategory[] = [];

  readonly iconOptions: string[] = [
    'briefcase-outline',
    'person-circle-outline',
    'terminal-outline',
    'book-outline',
    'fitness-outline',
    'sparkles-outline',
    'construct-outline',
  ];

  readonly colorOptions: string[] = ['#2879ff', '#18a55a', '#ff8a00', '#c84242', '#0f5b6f', '#8b3dff'];

  stages: { id: GtdStage; label: string }[] = [
    { id: 'inbox', label: 'Inbox' },
    { id: 'next', label: 'Proxima accion' },
    { id: 'waiting', label: 'En espera' },
    { id: 'scheduled', label: 'Programada' },
    { id: 'someday', label: 'Algun dia' },
    { id: 'done', label: 'Hecha' },
  ];

  tasks: TaskItem[] = [];
  shoppingItems: ShoppingItem[] = [];
  financeText = '';

  modeOptions: { id: AppMode; label: string }[] = [
    { id: 'gtd', label: 'GTD' },
    { id: 'shopping', label: 'Compras' },
    { id: 'finance', label: 'Finanzas' },
  ];

  selectedMode: AppMode = 'gtd';

  filterStage: 'all' | GtdStage = 'all';
  activeCategoryViewIndex = 0;
  isDarkMode = false;

  draft: TaskDraft = {
    title: '',
    notes: '',
    categoryId: '',
    stage: 'inbox',
  };

  categoryDraft: CategoryDraft = {
    label: '',
    color: '#0f5b6f',
    icon: 'construct-outline',
  };

  shoppingDraft: ShoppingDraft = {
    name: '',
    quantity: 1,
  };

  constructor() {
    this.initThemeState();
    this.loadCategories();
    this.loadTasks();
    this.loadShoppingItems();
    this.loadFinanceText();
    this.normalizeTaskCategories();
    this.ensureDraftCategory();
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme(this.isDarkMode);
    localStorage.setItem(this.themeStorageKey, this.isDarkMode ? 'dark' : 'light');
  }

  get categoryViews(): CategoryView[] {
    return [
      { id: 'all', label: 'General', color: '#54606d' },
      ...this.categories.map((category) => ({
        id: category.id,
        label: category.label,
        color: category.color,
      })),
    ];
  }

  get activeCategoryView(): CategoryView {
    return this.categoryViews[this.activeCategoryViewIndex] ?? this.categoryViews[0];
  }

  get activeCategoryId(): 'all' | TaskCategoryId {
    return this.activeCategoryView.id;
  }

  get filteredTasks(): TaskItem[] {
    return this.tasks.filter((task) => {
      const byCategory = this.activeCategoryId === 'all' || task.categoryId === this.activeCategoryId;
      const byStage = this.filterStage === 'all' || task.stage === this.filterStage;
      return byCategory && byStage;
    });
  }

  get openTasksCount(): number {
    return this.tasks.filter((task) => task.stage !== 'done').length;
  }

  get doneTasksCount(): number {
    return this.tasks.filter((task) => task.stage === 'done').length;
  }

  addCategory(): void {
    const label = this.categoryDraft.label.trim();
    if (!label) {
      return;
    }

    const id = this.buildUniqueCategoryId(label);
    const category: TaskCategory = {
      id,
      label,
      color: this.categoryDraft.color,
      icon: this.categoryDraft.icon,
    };

    this.categories = [...this.categories, category];
    this.saveCategories();
    this.draft.categoryId = category.id;
    this.categoryDraft.label = '';
    this.goToCategoryViewById(category.id);
  }

  addTask(): void {
    const title = this.draft.title.trim();
    if (!title) {
      return;
    }

    if (!this.categories.some((category) => category.id === this.draft.categoryId)) {
      this.draft.categoryId = this.categories[0]?.id ?? '';
    }

    if (!this.draft.categoryId) {
      return;
    }

    const now = new Date().toISOString();
    const task: TaskItem = {
      id: crypto.randomUUID(),
      title,
      notes: this.draft.notes.trim(),
      stage: this.draft.stage,
      categoryId: this.draft.categoryId,
      createdAt: now,
      updatedAt: now,
    };

    this.tasks = [task, ...this.tasks];
    this.saveTasks();
    this.draft.title = '';
    this.draft.notes = '';
    this.draft.stage = 'inbox';
  }

  addShoppingItem(): void {
    const name = this.shoppingDraft.name.trim();
    if (!name) {
      return;
    }

    const item: ShoppingItem = {
      id: crypto.randomUUID(),
      name,
      quantity: Math.max(1, Number(this.shoppingDraft.quantity) || 1),
      checked: false,
    };

    this.shoppingItems = [item, ...this.shoppingItems];
    this.shoppingDraft.name = '';
    this.shoppingDraft.quantity = 1;
    this.saveShoppingItems();
  }

  toggleShoppingItem(itemId: string): void {
    this.shoppingItems = this.shoppingItems.map((item) =>
      item.id === itemId
        ? {
          ...item,
          checked: !item.checked,
        }
        : item,
    );
    this.saveShoppingItems();
  }

  removeShoppingItem(itemId: string): void {
    this.shoppingItems = this.shoppingItems.filter((item) => item.id !== itemId);
    this.saveShoppingItems();
  }

  updateFinanceText(value: string | null | undefined): void {
    this.financeText = value ?? '';
    this.saveFinanceText();
  }

  updateStage(task: TaskItem, stage: GtdStage): void {
    if (task.stage === stage) {
      return;
    }

    this.tasks = this.tasks.map((item) => {
      if (item.id !== task.id) {
        return item;
      }

      return {
        ...item,
        stage,
        updatedAt: new Date().toISOString(),
      };
    });

    this.saveTasks();
  }

  removeTask(taskId: string): void {
    this.tasks = this.tasks.filter((task) => task.id !== taskId);
    this.saveTasks();
  }

  goNextCategoryView(): void {
    const maxIndex = this.categoryViews.length - 1;
    this.activeCategoryViewIndex = Math.min(this.activeCategoryViewIndex + 1, maxIndex);
  }

  goPreviousCategoryView(): void {
    this.activeCategoryViewIndex = Math.max(this.activeCategoryViewIndex - 1, 0);
  }

  onTaskListTouchStart(event: TouchEvent): void {
    const touch = event.changedTouches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
  }

  onTaskListTouchEnd(event: TouchEvent): void {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;

    if (Math.abs(deltaX) < 45 || Math.abs(deltaX) < Math.abs(deltaY)) {
      return;
    }

    // Se pidio navegar categorias al deslizar a la derecha.
    if (deltaX > 0) {
      this.goNextCategoryView();
      return;
    }

    this.goPreviousCategoryView();
  }

  getCategory(task: TaskItem): TaskCategory {
    return this.categories.find((category) => category.id === task.categoryId) ?? this.categories[0];
  }

  getStageLabel(stage: GtdStage): string {
    return this.stages.find((item) => item.id === stage)?.label ?? stage;
  }

  trackByTaskId(_index: number, task: TaskItem): string {
    return task.id;
  }

  trackByShoppingId(_index: number, item: ShoppingItem): string {
    return item.id;
  }

  private loadTasks(): void {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as TaskItem[];
      if (!Array.isArray(parsed)) {
        return;
      }

      this.tasks = parsed
        .filter((task) => !!task?.id && !!task?.title && !!task?.categoryId && !!task?.stage)
        .map((task) => ({
          ...task,
          categoryId: task.categoryId === 'bm' ? 'trabajo' : task.categoryId,
        }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } catch {
      this.tasks = [];
    }
  }

  private loadCategories(): void {
    const raw = localStorage.getItem(this.categoryStorageKey);

    if (!raw) {
      this.categories = this.getDefaultCategories();
      this.saveCategories();
      return;
    }

    try {
      const parsed = JSON.parse(raw) as TaskCategory[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.categories = this.getDefaultCategories();
        this.saveCategories();
        return;
      }

      const migrated = parsed
        .filter((category) => !!category?.id && !!category?.label)
        .map((category) => {
          if (category.id === 'bm') {
            return {
              ...category,
              id: 'trabajo',
              label: 'Trabajo',
            };
          }

          return category;
        });

      const deduped = migrated.filter(
        (category, index, list) => list.findIndex((item) => item.id === category.id) === index,
      );

      this.categories = deduped.length > 0 ? deduped : this.getDefaultCategories();
      this.saveCategories();
    } catch {
      this.categories = this.getDefaultCategories();
      this.saveCategories();
    }
  }

  private saveTasks(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
  }

  private loadShoppingItems(): void {
    const raw = localStorage.getItem(this.shoppingStorageKey);
    if (!raw) {
      this.shoppingItems = [];
      return;
    }

    try {
      const parsed = JSON.parse(raw) as ShoppingItem[];
      if (!Array.isArray(parsed)) {
        this.shoppingItems = [];
        return;
      }

      this.shoppingItems = parsed
        .filter((item) => !!item?.id && !!item?.name)
        .map((item) => ({
          ...item,
          quantity: Math.max(1, Number(item.quantity) || 1),
          checked: !!item.checked,
        }));
    } catch {
      this.shoppingItems = [];
    }
  }

  private saveShoppingItems(): void {
    localStorage.setItem(this.shoppingStorageKey, JSON.stringify(this.shoppingItems));
  }

  private loadFinanceText(): void {
    this.financeText = localStorage.getItem(this.financeStorageKey) ?? '';
  }

  private saveFinanceText(): void {
    localStorage.setItem(this.financeStorageKey, this.financeText);
  }

  private saveCategories(): void {
    localStorage.setItem(this.categoryStorageKey, JSON.stringify(this.categories));
  }

  private initThemeState(): void {
    const root = document.documentElement;
    const savedTheme = localStorage.getItem(this.themeStorageKey);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    this.isDarkMode = savedTheme ? savedTheme === 'dark' : root.classList.contains('dark') || prefersDark;
    this.applyTheme(this.isDarkMode);
  }

  private applyTheme(isDark: boolean): void {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    root.classList.toggle('ion-palette-dark', isDark);
  }

  private getDefaultCategories(): TaskCategory[] {
    return [
      { id: 'scriptdog', label: 'ScriptDog', color: '#2879ff', icon: 'terminal-outline' },
      { id: 'personal', label: 'Personal', color: '#18a55a', icon: 'person-circle-outline' },
      { id: 'trabajo', label: 'Trabajo', color: '#ff8a00', icon: 'briefcase-outline' },
    ];
  }

  private buildUniqueCategoryId(label: string): string {
    const base = label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `cat-${Date.now()}`;

    let candidate = base;
    let index = 1;

    while (this.categories.some((category) => category.id === candidate)) {
      candidate = `${base}-${index}`;
      index += 1;
    }

    return candidate;
  }

  private ensureDraftCategory(): void {
    if (!this.draft.categoryId || !this.categories.some((category) => category.id === this.draft.categoryId)) {
      this.draft.categoryId = this.categories[0]?.id ?? '';
    }
  }

  private normalizeTaskCategories(): void {
    let changed = false;

    this.tasks = this.tasks.map((task) => {
      let categoryId = task.categoryId;
      if (categoryId === 'bm') {
        categoryId = 'trabajo';
      }

      if (!this.categories.some((category) => category.id === categoryId)) {
        categoryId = this.categories[0]?.id ?? '';
      }

      if (categoryId !== task.categoryId) {
        changed = true;
      }

      return {
        ...task,
        categoryId,
      };
    });

    if (changed) {
      this.saveTasks();
    }
  }

  private goToCategoryViewById(id: TaskCategoryId): void {
    const nextIndex = this.categoryViews.findIndex((view) => view.id === id);
    if (nextIndex >= 0) {
      this.activeCategoryViewIndex = nextIndex;
    }
  }

}
