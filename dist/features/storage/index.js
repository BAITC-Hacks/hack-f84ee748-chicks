/* Версия v3 отделена от старых сохранений: изменена пространственная модель. */
GameFeatures.storage = {
  key: "astana-map-builder-v3",
  load(C) {
    try {
      const value = localStorage.getItem(this.key);
      return value ? C.validate(JSON.parse(value)) : C.initial();
    } catch {
      return C.initial();
    }
  },
  save(state, $) {
    try {
      localStorage.setItem(this.key, JSON.stringify(state));
      $("save-state").textContent = "Прогресс сохранён в этом браузере";
    } catch {
      $("save-state").textContent =
        "Сохранение недоступно: не закрывай вкладку";
    }
  },
};
