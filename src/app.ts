import { CategoryRepository } from './repositories/CategoryRepository';
import { ActivityRepository } from './repositories/ActivityRepository';
import { ReportService } from './services/ReportService';
import { NavigationController } from './controllers/NavigationController';
import { CategoryController } from './controllers/CategoryController';
import { ActivityController } from './controllers/ActivityController';
import { ReportController } from './controllers/ReportController';

document.addEventListener('DOMContentLoaded', () => {
  const categoryRepo = new CategoryRepository();
  const activityRepo = new ActivityRepository();
  const reportService = new ReportService(categoryRepo);

  new NavigationController();
  const activityController = new ActivityController(categoryRepo, activityRepo);
  new CategoryController(categoryRepo, activityRepo, () => {
    // при зміні категорій оновлюємо випадаючі списки та таблицю транзакцій
    activityController.populateCategoryDropdowns();
    activityController.render();
  });
  new ReportController(activityRepo, reportService);
});
