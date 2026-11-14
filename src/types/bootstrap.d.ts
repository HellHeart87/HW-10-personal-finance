// Bootstrap підключений через CDN, тому описуємо лише те, що використовуємо
interface BootstrapModal {
  show(): void;
  hide(): void;
}

declare const bootstrap: {
  Modal: new (element: Element) => BootstrapModal;
};
