import { $ } from '../utils/dom';

export class NavigationController {
  constructor() {
    const sections = [$('section-categories'), $('section-activities'), $('section-reports')];
    const buttons = [$('nav-categories-btn'), $('nav-activities-btn'), $('nav-reports-btn')];

    buttons.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        sections.forEach((s) => s.classList.add('d-none'));
        buttons.forEach((b) => b.classList.remove('active'));
        sections[i].classList.remove('d-none');
        btn.classList.add('active');
      });
    });
  }
}
