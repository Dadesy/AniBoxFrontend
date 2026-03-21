/**
 * Официальный фрагмент Yandex.Metrika (как в кабинете) — одной строкой для app.head.
 * Выполняется в браузере при разборе HTML (раньше, чем клиентские плагины).
 */
export function buildYandexMetrikaHeadScript(counterIdRaw: string): string {
  const id = String(counterIdRaw).replace(/\D/g, '') || '108180420'
  return `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=${id}','ym');window.dataLayer=window.dataLayer||[];ym(${id},'init',{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});`
}
