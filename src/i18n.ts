import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Lang = 'ru' | 'en';

type Dict = Record<string, string>;
type Resources = Record<Lang, Dict>;

const resources: Resources = {
  ru: {
    'app.logo': 'Studio NN',
    'nav.users': 'Пользователи',
    'nav.profile': 'Профиль',
    'nav.leisure': 'Досуг',
    'nav.aiChat': 'Чат ИИ',
    'auth.register': 'начать',
    'auth.login': 'Войти',
    
    'auth.logout': 'Выйти',
    'header.lang.tooltip_en': 'Switch to English',
    'header.lang.tooltip_ru': 'Переключить на русский',
    'theme.tooltip.light': 'Включить светлую тему',
    'theme.tooltip.dark': 'Включить тёмную тему',
    'notifications.title': 'Новые сообщения',
    'notifications.back': 'Назад',
    'notifications.empty': 'Пока нет новых сообщений',
    'notifications.latest': 'последнее:',
    'notifications.delete': 'Удалить',
    'notifications.deleteAll': 'Удалить все',
    'notifications.reply': 'Ответить',
    'test.run': 'Тест',
    'test.ok': 'API: {{api}}, DB: {{db}}, Redis: {{redis}}, Авторизован: {{auth}}',
    'message.new': 'Новое сообщение',
    'message.to': 'Кому',
    'message.body': 'Сообщение',
    'message.placeholder': 'Напишите сообщение…',
    'message.send': 'Отправить',
    'message.hint_length': 'сообщение должно быть не более {{max}} символов'
    ,
    // HomePage
    'home.hero.tagline': 'Добро пожаловать в Studio NN',
    'home.hero.title': 'Встретимся в месте, где легко и приятно',
    'home.hero.desc': 'Studio NN — это дружелюбная площадка, где можно познакомиться с новыми людьми, заняться любимыми делами и просто отдохнуть. Присоединяйтесь, чтобы не пропустить самое интересное.',
    'home.hero.cta.join': 'Присоединиться сейчас',
    'home.hero.cta.login': 'Уже с нами? Войти →',
    'home.device.badge': 'Community vibes',
    'home.device.title': 'Подбираем занятия под настроение',
    'home.device.text': 'Сообщения друзей, новые знакомства и идеи для досуга — всё в одном месте.',
    'home.device.cta': 'Скорее к нам →',
    'home.scroll.down': 'Листайте вниз',
    'home.vibe.title': 'Чем займёмся сегодня?',
    'home.vibe.desc': 'Заходите, когда хочется вдохновения, общения или просто приятной паузы в течение дня.',
    'home.vibe.1.title': 'Живое сообщество',
    'home.vibe.1.text': 'Знакомьтесь, общайтесь и делитесь настроением с людьми, которым близки ваши интересы.',
    'home.vibe.2.title': 'Зона отдыха',
    'home.vibe.2.text': 'Развлечения, подборки и полезные активности, чтобы отвлечься от рутины и зарядиться энергией.',
    'home.vibe.3.title': 'Личный профиль',
    'home.vibe.3.text': 'Настраивайте свою страницу, следите за статистикой и мгновенно отвечайте на уведомления.',
    'home.invite.title': 'Присоединяйтесь — у нас уютно',
    'home.invite.text': 'Сделайте первый шаг к новым впечатлениям. Создав аккаунт, вы сможете отправлять уведомления друзьям, видеть кто онлайн и открывать свежие активности каждый день.',
    'home.invite.cta.create': 'Создать аккаунт',
    'home.invite.cta.login': 'Войти в аккаунт'
    ,
    // LoginPage
    'login.back': 'На главную',
    'login.title': 'Вход в систему',
    'login.description': 'Введите имя пользователя и пароль.',
    'login.username': 'Имя пользователя:',
    'login.username.placeholder': 'Введите ваше имя',
    'login.password': 'Пароль:',
    'login.password.placeholder': 'Введите пароль',
    'login.password.toggle.show': 'Показать пароль',
    'login.password.toggle.hide': 'Скрыть пароль',
    'login.submit': 'Войти',
    'login.submitting': 'Вход...',
    'login.error.invalid': 'Неверное имя пользователя или пароль',
    'login.hint.title': 'Тестовые данные:',
    'login.hint.user': 'Обычный пользователь: Имя "Алексей", пароль "111"',
    'login.hint.admin': 'Администратор: Имя "Alex", пароль "222"',
    'login.hint.note': 'Работает с кириллицей и латиницей!'
    ,
    // RegisterPage
    'register.title': 'Регистрация',
    'register.subtitle': 'Создайте новый аккаунт',
    'register.name': 'Имя пользователя:',
    'register.name.placeholder': 'Введите ваше имя (уникальное)',
    'register.age': 'Возраст:',
    'register.age.placeholder': 'Ваш возраст',
    'register.gender': 'Пол:',
    'register.gender.choose': '-- Выберите пол --',
    'register.gender.male': 'Мужской',
    'register.gender.female': 'Женский',
    'register.email': 'Email:',
    'register.email.placeholder': 'example@mail.com (поддерживаются плюс-адреса: name+test@mail.com)',
    'register.password': 'Пароль:',
    'register.password.placeholder': 'Не менее 5 символов',
    'register.password.confirm': 'Подтвердите пароль:',
    'register.password.confirm.placeholder': 'Повторите пароль',
    'register.code.label': 'Код подтверждения (6 цифр):',
    'register.code.placeholder': 'Введите код из письма',
    'register.code.hint': 'Код отправлен на тестовую почту (сервер использует фиксированный адрес для отправки).',
    'register.error.mismatch': 'Пароли не совпадают',
    'register.error.short': 'Пароль должен быть не менее 5 символов',
    'register.error.age': 'Возраст должен быть от 1 до 120 лет',
    'register.error.gender': 'Пожалуйста, выберите пол',
    'register.error.email': 'Введите корректный email адрес',
    'register.submit.register': 'Зарегистрироваться',
    'register.submit.verify': 'Подтвердить код',
    'register.submitting.register': 'Отправка кода...',
    'register.submitting.verify': 'Подтверждение...',
    'register.link.have': 'Уже есть аккаунт?',
    'register.link.login': 'Войти'
    ,
    // Leisure (partial)
    'leisure.title': 'Добро пожаловать, {{name}}!',
    'leisure.subtitle': 'Отдохните и расслабьтесь после работы с пользователями',
    'leisure.col.left': '📰 Технологии и бизнес',
    'leisure.col.right': '🚀 Разработка и IT',
    'leisure.loading.cnews': 'Загружаем новости CNews...',
    'leisure.loading.habr': 'Загружаем новости Habr...'
    ,
    // Leisure extras
    'leisure.theme.light': 'Светлая',
    'leisure.theme.dark': 'Тёмная',
    'leisure.theme.night': 'Ночная',
    'leisure.theme.label': 'Тема досуга:',
    'leisure.theme.info': 'Локальная настройка • Не влияет на другие страницы',
    'leisure.theme.change': 'Сменить тему досуга (текущая: {{name}})',
    'leisure.facts.title': '📖 Интересные факты',
    'leisure.fact.1': 'Первая компьютерная мышь была сделана из дерева',
    'leisure.fact.2': 'QWERTY-раскладка была создана для замедления печати',
    'leisure.fact.3': 'Первый веб-сайт до сих пор работает: info.cern.ch',
    'leisure.fact.4': 'Первый спам-email был отправлен в 1978 году',
    'leisure.actions.title': '⚡ Быстрые действия',
    'leisure.actions.music.title': 'Фоновая музыка',
    'leisure.actions.music.text': 'Расслабляющие звуки для работы',
    'leisure.actions.games.title': 'Мини-игры',
    'leisure.actions.games.text': 'Скоро будет доступно',
    'leisure.actions.exercises.title': 'Упражнения',
    'leisure.actions.exercises.text': 'Скоро будет доступно',
    'leisure.actions.soon': 'Скоро',
    'leisure.motivation.title': '💫 Мотивация на сегодня',
    'leisure.motivation.quote': '"Лучший способ взяться за что-то — перестать говорить и начать делать."',
    'leisure.motivation.author': '— Уолт Дисней'
    ,
    // ProfilePage
    'back.home': 'На главную',
    'profile.title': '👤 Личный кабинет',
    'profile.subtitle': 'Ваша персональная информация',
    'profile.loading': 'Загрузка профиля...',
    'profile.error': 'Ошибка:',
    'profile.role.special': '🌟 Специальная роль:',
    'profile.role.pretty': '💖 Красивый пользователь',
    'profile.role.common': '👤 Обычный пользователь',
    'profile.id': '🆔 ID пользователя:',
    'profile.name': '📛 Имя пользователя:',
    'profile.age': '🎂 Возраст:',
    'profile.age.unknown': 'Не указан',
    'profile.gender': '⚧ Пол:',
    'profile.gender.female': '💖 Женский',
    'profile.gender.male': '👨 Мужской',
    'profile.gender.unknown': '⚧ Не указан',
    'profile.email': '📧 Email:',
    'profile.stats.title': '📊 Статистика системы',
    'profile.stats.total': 'Всего пользователей',
    'profile.stats.female': 'Женщин',
    'profile.stats.male': 'Мужчин',
    'profile.stats.online': 'Сейчас онлайн',
    'profile.notice.title': 'Вы - особенная!',
    'profile.notice.text': 'Как Красивый пользователь, вы получаете эксклюзивный статус в нашей системе!',
    'profile.actions.users': '👥 Посмотреть всех пользователей',
    'profile.actions.leisure': '🎮 Досуг',
    'profile.actions.home': '🏠 На главную'
    ,
    // UsersPage
    'users.title': 'Список пользователей',
    'users.subtitle': 'Все пользователи из базы данных PostgreSQL',
    'users.filter.gender': 'Пол:',
    'users.filter.gender.all': 'Все',
    'users.filter.gender.male': 'Мужчины',
    'users.filter.gender.female': 'Женщины',
    'users.filter.online': 'Online',
    'users.filter.offline': 'Offline',
    'users.empty': 'На этой странице пока нет других пользователей',
    'users.loadMore': 'Показать ещё',
    'users.loading': 'Обновляем список…',
    'users.footer.prefix': 'На странице онлайн:',
    'users.footer.of': 'из'
    ,
    // AI chat
    'ai.eyebrow': 'Экспериментально',
    'ai.title': 'Чат с ИИ',
    'ai.subtitle': 'Быстрые подсказки, идеи и ответы. Интерфейс упрощён, чтобы вы могли сосредоточиться на диалоге.',
    'ai.cta.line1': 'Чат',
    'ai.cta.line2': 'ИИ',
    'ai.meta.availability': 'Доступно 24/7',
    'ai.meta.updated': 'Обновлено: сегодня',
    'ai.greeting': 'Привет, чем могу помочь?',
    'ai.placeholder': 'Спросите что угодно…',
    'ai.status.sending': 'Отправка…',
    'ai.error.request': 'Ошибка запроса',
    'ai.assistantName': 'Мила',
    'ai.you': 'Вы'
  },
  en: {
    'app.logo': 'Studio NN',
    'nav.users': 'Users',
    'nav.profile': 'Profile',
    'nav.leisure': 'Leisure',
    'nav.aiChat': 'AI Chat',
    'auth.register': 'Register',
    'auth.login': 'Log in',
    
    'auth.logout': 'Log out',
    'header.lang.tooltip_en': 'Switch to English',
    'header.lang.tooltip_ru': 'Switch to Russian',
    'theme.tooltip.light': 'Enable light theme',
    'theme.tooltip.dark': 'Enable dark theme',
    'notifications.title': 'New messages',
    'notifications.back': 'Back',
    'notifications.empty': 'No new messages yet',
    'notifications.latest': 'latest:',
    'notifications.delete': 'Delete',
    'notifications.deleteAll': 'Delete all',
    'notifications.reply': 'Reply',
    'test.run': 'Test',
    'test.ok': 'API: {{api}}, DB: {{db}}, Redis: {{redis}}, Auth: {{auth}}',
    'message.new': 'New message',
    'message.to': 'To',
    'message.body': 'Message',
    'message.placeholder': 'Write your message…',
    'message.send': 'Send',
    'message.hint_length': 'message must be no more than {{max}} characters'
    ,
    // HomePage
    'home.hero.tagline': 'Welcome to Studio NN',
    'home.hero.title': 'Meet where it’s easy and pleasant',
    'home.hero.desc': 'Studio NN is a friendly place to meet new people, do your favorite things, and just relax. Join to keep up with the most interesting.',
    'home.hero.cta.join': 'Join now',
    'home.hero.cta.login': 'Already with us? Sign in →',
    'home.device.badge': 'Community vibes',
    'home.device.title': 'We match activities to your mood',
    'home.device.text': 'Friends’ messages, new connections, and leisure ideas — all in one place.',
    'home.device.cta': 'Jump in →',
    'home.scroll.down': 'Scroll down',
    'home.vibe.title': 'What shall we do today?',
    'home.vibe.desc': 'Come by when you want inspiration, a chat, or just a pleasant break during the day.',
    'home.vibe.1.title': 'Vibrant community',
    'home.vibe.1.text': 'Meet, chat, and share your mood with people who share your interests.',
    'home.vibe.2.title': 'Relax zone',
    'home.vibe.2.text': 'Entertainment, picks, and useful activities to unwind and recharge.',
    'home.vibe.3.title': 'Personal profile',
    'home.vibe.3.text': 'Customize your page, watch stats, and reply to notifications instantly.',
    'home.invite.title': 'Join us — it’s cozy here',
    'home.invite.text': 'Take the first step to new experiences. Create an account to notify friends, see who’s online, and open fresh activities every day.',
    'home.invite.cta.create': 'Create account',
    'home.invite.cta.login': 'Sign in'
    ,
    // LoginPage
    'login.back': 'Home',
    'login.title': 'Sign in',
    'login.description': 'Enter your username and password.',
    'login.username': 'Username:',
    'login.username.placeholder': 'Enter your name',
    'login.password': 'Password:',
    'login.password.placeholder': 'Enter your password',
    'login.password.toggle.show': 'Show password',
    'login.password.toggle.hide': 'Hide password',
    'login.submit': 'Log in',
    'login.submitting': 'Signing in...',
    'login.error.invalid': 'Invalid username or password',
    'login.hint.title': 'Test credentials:',
    'login.hint.user': 'User: Name "Алексей", password "111"',
    'login.hint.admin': 'Admin: Name "Alex", password "222"',
    'login.hint.note': 'Works with Cyrillic and Latin!'
    ,
    // RegisterPage
    'register.title': 'Register',
    'register.subtitle': 'Create a new account',
    'register.name': 'Username:',
    'register.name.placeholder': 'Enter your (unique) name',
    'register.age': 'Age:',
    'register.age.placeholder': 'Your age',
    'register.gender': 'Gender:',
    'register.gender.choose': '-- Select gender --',
    'register.gender.male': 'Male',
    'register.gender.female': 'Female',
    'register.email': 'Email:',
    'register.email.placeholder': 'example@mail.com (plus addressing supported: name+test@mail.com)',
    'register.password': 'Password:',
    'register.password.placeholder': 'At least 5 characters',
    'register.password.confirm': 'Confirm password:',
    'register.password.confirm.placeholder': 'Repeat password',
    'register.code.label': 'Verification code (6 digits):',
    'register.code.placeholder': 'Enter the code from email',
    'register.code.hint': 'The code is sent to a test mailbox (server uses a fixed sender).',
    'register.error.mismatch': 'Passwords do not match',
    'register.error.short': 'Password must be at least 5 characters',
    'register.error.age': 'Age must be 1 to 120',
    'register.error.gender': 'Please choose a gender',
    'register.error.email': 'Enter a valid email address',
    'register.submit.register': 'Register',
    'register.submit.verify': 'Verify code',
    'register.submitting.register': 'Sending code...',
    'register.submitting.verify': 'Verifying...',
    'register.link.have': 'Already have an account?',
    'register.link.login': 'Log in'
    ,
    // Leisure (partial)
    'leisure.title': 'Welcome, {{name}}!',
    'leisure.subtitle': 'Relax and unwind after work with users',
    'leisure.col.left': '📰 Tech and business',
    'leisure.col.right': '🚀 Development and IT',
    'leisure.loading.cnews': 'Loading CNews...',
    'leisure.loading.habr': 'Loading Habr...'
    ,
    // Leisure extras
    'leisure.theme.light': 'Light',
    'leisure.theme.dark': 'Dark',
    'leisure.theme.night': 'Night',
    'leisure.theme.label': 'Leisure theme:',
    'leisure.theme.info': 'Local setting • Does not affect other pages',
    'leisure.theme.change': 'Change leisure theme (current: {{name}})',
    'leisure.facts.title': '📖 Interesting facts',
    'leisure.fact.1': 'The first computer mouse was made of wood',
    'leisure.fact.2': 'The QWERTY layout was designed to slow down typing',
    'leisure.fact.3': 'The first website still works: info.cern.ch',
    'leisure.fact.4': 'The first spam email was sent in 1978',
    'leisure.actions.title': '⚡ Quick actions',
    'leisure.actions.music.title': 'Background music',
    'leisure.actions.music.text': 'Relaxing sounds for work',
    'leisure.actions.games.title': 'Mini games',
    'leisure.actions.games.text': 'Coming soon',
    'leisure.actions.exercises.title': 'Exercises',
    'leisure.actions.exercises.text': 'Coming soon',
    'leisure.actions.soon': 'Soon',
    'leisure.motivation.title': '💫 Motivation for today',
    'leisure.motivation.quote': '"The best way to get started is to stop talking and start doing."',
    'leisure.motivation.author': '— Walt Disney'
    ,
    // ProfilePage
    'back.home': 'Home',
    'profile.title': '👤 Profile',
    'profile.subtitle': 'Your personal information',
    'profile.loading': 'Loading profile...',
    'profile.error': 'Error:',
    'profile.role.special': '🌟 Special role:',
    'profile.role.pretty': '💖 Beautiful user',
    'profile.role.common': '👤 Regular user',
    'profile.id': '🆔 User ID:',
    'profile.name': '📛 Username:',
    'profile.age': '🎂 Age:',
    'profile.age.unknown': 'Not specified',
    'profile.gender': '⚧ Gender:',
    'profile.gender.female': '💖 Female',
    'profile.gender.male': '👨 Male',
    'profile.gender.unknown': '⚧ Not specified',
    'profile.email': '📧 Email:',
    'profile.stats.title': '📊 System statistics',
    'profile.stats.total': 'Total users',
    'profile.stats.female': 'Female',
    'profile.stats.male': 'Male',
    'profile.stats.online': 'Online now',
    'profile.notice.title': 'You are special!',
    'profile.notice.text': 'As a Beautiful user, you get an exclusive status in our system!',
    'profile.actions.users': '👥 View all users',
    'profile.actions.leisure': '🎮 Leisure',
    'profile.actions.home': '🏠 Home'
    ,
    // UsersPage
    'users.title': 'Users',
    'users.subtitle': 'All users from the PostgreSQL database',
    'users.filter.gender': 'Gender:',
    'users.filter.gender.all': 'All',
    'users.filter.gender.male': 'Male',
    'users.filter.gender.female': 'Female',
    'users.filter.online': 'Online',
    'users.filter.offline': 'Offline',
    'users.empty': 'There are no other users on this page yet',
    'users.loadMore': 'Show more',
    'users.loading': 'Refreshing list…',
    'users.footer.prefix': 'Online on page:',
    'users.footer.of': 'of'
    ,
    // AI chat
    'ai.eyebrow': 'Experimental',
    'ai.title': 'AI Chat',
    'ai.subtitle': 'Fast prompts, ideas, and answers. A minimal interface so you can focus on the conversation.',
    'ai.cta.line1': 'AI',
    'ai.cta.line2': 'Chat',
    'ai.meta.availability': 'Available 24/7',
    'ai.meta.updated': 'Updated: today',
    'ai.greeting': 'Hi, how can I help you?',
    'ai.placeholder': 'Ask me anything…',
    'ai.status.sending': 'Sending…',
    'ai.error.request': 'Request failed',
    'ai.assistantName': 'Mila',
    'ai.you': 'You'
  },
};

type I18nContextType = {
  language: Lang;
  setLanguage: React.Dispatch<React.SetStateAction<Lang>>;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'ru';
    const saved = (localStorage.getItem('app_language') as Lang) || 'ru';
    return saved === 'en' ? 'en' : 'ru';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('app_language', language);
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const t = useMemo(() => {
    return (key: string, vars?: Record<string, string | number>) => {
      const dict = resources[language] || resources.ru;
      let out = dict[key] || resources.ru[key] || key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          out = out.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
        }
      }
      return out;
    };
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, t]);

  return React.createElement(I18nContext.Provider, { value }, children as any);
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export function getLocale(language: Lang): string {
  return language === 'en' ? 'en-US' : 'ru-RU';
}
