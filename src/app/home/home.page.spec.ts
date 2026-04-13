import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HomePage } from './home.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let getItemSpy: jasmine.Spy;
  let matchMediaSpy: jasmine.Spy;

  beforeEach(async () => {
    document.documentElement.classList.remove('dark', 'ion-palette-dark');

    getItemSpy = spyOn(window.localStorage, 'getItem').and.callFake((key: string): string | null => {
      if (key === 'gtd.memo.tasks.v1') {
        return null;
      }

      if (key === 'gtd.memo.categories.v1') {
        return null;
      }

      if (key === 'gtd.memo.theme.v1') {
        return 'light';
      }

      return null;
    });
    spyOn(window.localStorage, 'setItem').and.stub();
    matchMediaSpy = spyOn(window, 'matchMedia').and.returnValue({
      matches: false,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    } as MediaQueryList);

    await TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create custom category and move category view to it', () => {
    component.categoryDraft.label = 'Finanzas';
    component.categoryDraft.color = '#c84242';
    component.categoryDraft.icon = 'book-outline';

    component.addCategory();

    const created = component.categories.find((category) => category.label === 'Finanzas');
    expect(created).toBeTruthy();
    expect(created).toBeTruthy();
    expect(component.draft.categoryId).toBe(created!.id);
    expect(component.activeCategoryView.label).toBe('Finanzas');
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      'gtd.memo.categories.v1',
      jasmine.any(String),
    );
  });

  it('should filter tasks by active category and stage', () => {
    component.tasks = [
      {
        id: '1',
        title: 'Task A',
        notes: '',
        stage: 'inbox',
        categoryId: 'scriptdog',
        createdAt: '2026-04-01T10:00:00.000Z',
        updatedAt: '2026-04-01T10:00:00.000Z',
      },
      {
        id: '2',
        title: 'Task B',
        notes: '',
        stage: 'done',
        categoryId: 'personal',
        createdAt: '2026-04-01T11:00:00.000Z',
        updatedAt: '2026-04-01T11:00:00.000Z',
      },
    ];

    component.filterStage = 'all';
    expect(component.filteredTasks.length).toBe(2);

    component.goNextCategoryView();
    expect(component.activeCategoryId).toBe('scriptdog');
    expect(component.filteredTasks.length).toBe(1);

    component.filterStage = 'done';
    expect(component.filteredTasks.length).toBe(0);
  });

  it('should move category view on swipe gestures', () => {
    component.onTaskListTouchStart({
      changedTouches: [{ clientX: 10, clientY: 10 }],
    } as unknown as TouchEvent);

    component.onTaskListTouchEnd({
      changedTouches: [{ clientX: 90, clientY: 14 }],
    } as unknown as TouchEvent);

    expect(component.activeCategoryViewIndex).toBe(1);

    component.onTaskListTouchStart({
      changedTouches: [{ clientX: 90, clientY: 14 }],
    } as unknown as TouchEvent);

    component.onTaskListTouchEnd({
      changedTouches: [{ clientX: 20, clientY: 16 }],
    } as unknown as TouchEvent);

    expect(component.activeCategoryViewIndex).toBe(0);
  });

  it('should update task stage and persist tasks', () => {
    component.tasks = [
      {
        id: 'x1',
        title: 'Task Update',
        notes: '',
        stage: 'inbox',
        categoryId: 'trabajo',
        createdAt: '2026-04-01T10:00:00.000Z',
        updatedAt: '2026-04-01T10:00:00.000Z',
      },
    ];

    component.updateStage(component.tasks[0], 'done');

    expect(component.tasks[0].stage).toBe('done');
    expect(window.localStorage.setItem).toHaveBeenCalledWith('gtd.memo.tasks.v1', jasmine.any(String));
  });

  it('should toggle dark mode and persist selected theme', () => {
    expect(component.isDarkMode).toBeFalse();

    component.toggleDarkMode();

    expect(component.isDarkMode).toBeTrue();
    expect(document.documentElement.classList.contains('dark')).toBeTrue();
    expect(window.localStorage.setItem).toHaveBeenCalledWith('gtd.memo.theme.v1', 'dark');
  });

  it('should migrate bm category ids on loadTasks', () => {
    getItemSpy['and'].callFake((key: string): string | null => {
      if (key === 'gtd.memo.tasks.v1') {
        return JSON.stringify([
          {
            id: 'm1',
            title: 'Legacy BM',
            notes: '',
            stage: 'inbox',
            categoryId: 'bm',
            createdAt: '2026-04-01T10:00:00.000Z',
            updatedAt: '2026-04-01T10:00:00.000Z',
          },
        ]);
      }

      if (key === 'gtd.memo.categories.v1') {
        return JSON.stringify([
          { id: 'scriptdog', label: 'ScriptDog', color: '#2879ff', icon: 'terminal-outline' },
          { id: 'personal', label: 'Personal', color: '#18a55a', icon: 'person-circle-outline' },
          { id: 'trabajo', label: 'Trabajo', color: '#ff8a00', icon: 'briefcase-outline' },
        ]);
      }

      if (key === 'gtd.memo.theme.v1') {
        return 'light';
      }

      return null;
    });
    matchMediaSpy.and.returnValue({
      matches: false,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    } as MediaQueryList);

    const secondFixture = TestBed.createComponent(HomePage);
    const secondComponent = secondFixture.componentInstance;

    expect(secondComponent.tasks[0].categoryId).toBe('trabajo');
  });
});
