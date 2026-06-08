import { db, widgetsTable } from "@workspace/db";
import { logger } from "./lib/logger";

const SEED_WIDGETS = [
  { title: "Расписание физфака", url: "https://physics.msu.ru/rus/study/timetable/", description: "Расписание занятий на физическом факультете МГУ", icon: "📅", order: 0 },
  { title: "Антимода", url: "http://anti-moda.ru/", description: "Сайт содержит методические пособия для студентов физфака, структурированные по курсам и семестрам", icon: "📖", order: 1 },
  { title: "Teach-in", url: "https://teach-in.ru/", description: "Открытые видеолекции МГУ: курсы и лекции по физике, астрономии, биологии и другим наукам", icon: "🎬", order: 2 },
  { title: "МФК", url: "https://mfc.msu.ru/", description: "Регистрация на межфакультетские курсы в МГУ", icon: "✏️", order: 3 },
  { title: "Дубинушка", url: "https://dubinushka.ru/", description: "Сайт о жизни и учёбе на физическом факультете МГУ: события, преподаватели, материалы", icon: "🎓", order: 4 },
  { title: "Калькулятор стипендии", url: "https://app.profcomff.com/apps/39", description: "Калькулятор для расчёта выплат со стипендий", icon: "🧮", order: 5 },
  { title: "Схема этажей физфака", url: "https://app.profcomff.com/apps/2", description: "Карта со схемами всех этажей на физфаке", icon: "🗺️", order: 6 },
  { title: "Истина", url: "https://istina.msu.ru/", description: "Учёт и анализ научной деятельности сотрудников МГУ: публикации, доклады, проекты", icon: "📊", order: 7 },
  { title: "Пропуск на машину", url: "https://app.profcomff.com/apps/7", description: "Форма для получения QR-кода для проезда на территорию МГУ", icon: "🚗", order: 8 },
  { title: "Umos", url: "https://bill.umos.msu.ru/", description: "Оплата интернета в общежитиях МГУ", icon: "🌐", order: 9 },
  { title: "Кафе «Факультет»", url: "https://vk.com/cafe_fak", description: "Онлайн заказ еды в главном здании", icon: "🍽️", order: 10 },
  { title: "ВВХ", url: "https://vk.com/vvh_msu", description: "Студенческая группа физфака МГУ с материалами по учёбе", icon: "📚", order: 11 },
  { title: "ГП", url: "https://vk.com/gp_msu", description: "Студенческая группа с материалами по пракам", icon: "🔬", order: 12 },
  { title: "Бесплатный принтер ДСЛ", url: "https://vk.com/print_dsl", description: "Бесплатная печать в ДСЛ для студентов физфака", icon: "🖨️", order: 13 },
  { title: "Бесплатный принтер ДС", url: "https://vk.com/freeprint_ds", description: "Бесплатная печать в ДС для студентов физфака", icon: "📋", order: 14 },
  { title: "Запись в постирочную ДСЛ", url: "https://dikidi.net/947032?p=0.pi", description: "Онлайн запись в постирочную общежития ДСЛ для физфака", icon: "🧺", order: 15 },
  { title: "Запись в постирочную ДС корпус В", url: "https://vk.com/laundry_ds", description: "Онлайн запись в постирочную общежития ДС корпуса В", icon: "🫧", order: 16 },
  { title: "Инфраструктура ДСЛ", url: "https://vk.com/@studcomdsl-faq-3-infrastruktura-dsl", description: "Информация об инфраструктуре ДСЛ: студком, прачечная, спортзал, коворкинг, правила для гостей и многое другое", icon: "🏠", order: 17 },
  { title: "Инфраструктура ДС", url: "https://vk.com/@studcomds-faq-3-infrastruktura-ds", description: "FAQ об инфраструктуре ДС: бюро пропусков, столовые, банкоматы, прачечные, коворкинги и другие службы", icon: "🏢", order: 18 },
  { title: "Инфраструктура ДСВ", url: "https://vk.com/@studcomdsv-obschezhitie-dlya-inogorodnih-studentov-dsv-mgu", description: "Информация об общежитии ДСВ МГУ: условия проживания, клубы, спорт, пропускной режим", icon: "🌐", order: 19 },
  { title: "Инфраструктура ФДС", url: "https://vk.com/@studcomfds-faq-3-vnutri-obschezhitiya-infrastruktura", description: "FAQ об инфраструктуре ФДС: студком, постирочная, спортивная комната, места для учёбы и отдыха", icon: "🏫", order: 20 },
  { title: "Инфраструктура ДАС", url: "https://vk.com/@studcomdas-was-ist-das-3-vnutrennyaya-zhizn-obschezhitiya", description: "Внутренняя жизнь ДАС: администрация, столовая, постирочные, спортзал, коворкинг, правила для гостей", icon: "🏛️", order: 21 },
];

export async function seedWidgets() {
  try {
    const existing = await db.select({ title: widgetsTable.title }).from(widgetsTable);
    const existingTitles = new Set(existing.map(w => w.title));

    const missing = SEED_WIDGETS.filter(w => !existingTitles.has(w.title));
    if (missing.length === 0) {
      logger.info("Seed: all widgets already present");
      return;
    }

    await db.insert(widgetsTable).values(missing);
    logger.info({ count: missing.length }, "Seed: inserted missing widgets");
  } catch (err) {
    logger.error({ err }, "Seed: failed to seed widgets");
  }
}
