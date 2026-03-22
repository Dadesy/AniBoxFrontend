<script setup lang="ts">
const { siteName } = useSiteBranding()

useSeoMeta({
  title: computed(() => `Политика конфиденциальности — ${siteName.value}`),
  description: 'Политика конфиденциальности и использования данных.',
  robots: 'index, follow',
})
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="space-y-8 text-sm leading-relaxed text-slate-300">

      <div>
        <h1 class="text-2xl font-bold text-white">Политика конфиденциальности</h1>
        <p class="mt-2 text-slate-500">Последнее обновление: 2025 г.</p>
      </div>

      <section class="space-y-3">
        <h2 class="text-base font-semibold text-white">1. Общие положения</h2>
        <p>
          Сайт <strong class="text-white">{{ siteName }}</strong> (далее — «Сайт») предоставляет
          информацию об аниме и обеспечивает удобный онлайн-просмотр. Данный документ описывает,
          какие данные мы собираем и как используем их.
        </p>
      </section>

      <section class="space-y-3">
        <h2 class="text-base font-semibold text-white">2. Собираемые данные</h2>
        <ul class="list-disc space-y-1.5 pl-5 text-slate-400">
          <li>
            <strong class="text-slate-200">Аккаунт.</strong> При регистрации — email-адрес.
            Пароль не используется: вход осуществляется по одноразовому коду.
          </li>
          <li>
            <strong class="text-slate-200">История просмотров.</strong> Сохраняется локально
            и на сервере только для зарегистрированных пользователей.
          </li>
          <li>
            <strong class="text-slate-200">Технические данные.</strong> IP-адрес и User-Agent
            могут фиксироваться в системных журналах сервера для обеспечения безопасности.
          </li>
        </ul>
      </section>

      <section class="space-y-3">
        <h2 class="text-base font-semibold text-white">3. Аналитика</h2>
        <p>
          Сайт использует <strong class="text-slate-200">Яндекс.Метрику</strong> для сбора
          анонимной статистики посещений. Счётчик собирает обезличенные данные о поведении
          пользователей (просматриваемые страницы, время на сайте). Персональные данные
          при этом не передаются третьим лицам.
        </p>
        <p>
          Политика обработки данных Яндекса:
          <a
            href="https://yandex.ru/legal/confidential/"
            target="_blank"
            rel="noopener noreferrer"
            class="text-emerald-400 underline-offset-2 hover:underline"
          >yandex.ru/legal/confidential</a>.
        </p>
      </section>

      <section class="space-y-3">
        <h2 class="text-base font-semibold text-white">4. Cookie</h2>
        <p>
          Сайт использует cookie для поддержания авторизованной сессии (HttpOnly, не доступны
          JavaScript). Аналитические cookie Яндекс.Метрики могут сохраняться в вашем браузере
          при посещении сайта.
        </p>
      </section>

      <section class="space-y-3">
        <h2 class="text-base font-semibold text-white">5. Авторские права</h2>
        <p>
          Все права на произведения (обложки, описания, трейлеры) принадлежат их правообладателям.
          Сайт не хранит видеоконтент — воспроизведение осуществляется через встроенные
          плееры сторонних провайдеров.
        </p>
      </section>

      <section class="space-y-3">
        <h2 class="text-base font-semibold text-white">6. Удаление данных</h2>
        <p>
          Вы можете запросить удаление вашего аккаунта и всех связанных данных, написав нам
          через форму обратной связи или по контактным данным на сайте.
        </p>
      </section>

      <div class="rounded-xl border border-white/8 bg-white/3 p-4 text-slate-500">
        <p>
          Продолжая использовать Сайт, вы соглашаетесь с условиями данной политики.
          Мы можем обновлять документ — о существенных изменениях будем уведомлять.
        </p>
      </div>
    </div>
  </div>
</template>
