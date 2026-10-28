# Preparación de Enlaces de Descarga para el Sitio Web

> **Nota para el propietario:** Según la regla estricta del proyecto, el código del sitio web (`MiPrimeraApp`) **no fue modificado**.
> Podés copiar y pegar este bloque cuando decidas publicar la aplicación.

---

## 1. Código listo para insertar en la Web (HTML / Tailwind CSS)

```html
<!-- SECCIÓN DESCARGA APP TOTALHIIT -->
<section id="descargar-app" class="bg-gradient-to-br from-zinc-900 to-black text-white py-16 px-4 sm:px-6 lg:px-8">
  <div class="max-w-4xl mx-auto text-center space-y-6">
    <span class="inline-block px-3 py-1 bg-pink-600/20 text-pink-400 border border-pink-500/30 rounded-full text-xs font-semibold tracking-wider uppercase">
      Ya disponible
    </span>
    
    <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight">
      Llevá <span class="text-[#B00050]">TOTALHIIT</span> siempre con vos
    </h2>
    
    <p class="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto">
      Entrenamientos adaptados, calculadoras de salud, menús semanales personalizados y seguimiento íntimo con máxima privacidad para mujeres +40.
    </p>

    <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
      <!-- Botón Android APK -->
      <a
        href="/descargas/totalhiit.apk"
        download="totalhiit.apk"
        class="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3.5 bg-[#B00050] hover:bg-[#8e0040] text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
      >
        <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-1.0002 0-.5517.4482-1.0002.9993-1.0002.5517 0 .9996.4485.9996 1.0002 0 .5516-.4479 1.0002-.9996 1.0002m-11.046 0c-.5511 0-.9993-.4486-.9993-1.0002 0-.5517.4482-1.0002.9993-1.0002.5516 0 .9996.4485.9996 1.0002 0 .5516-.448 1.0002-.9996 1.0002m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5896 8.4116 13.8561 8.1 12 8.1c-1.8562 0-3.5896.4116-5.1368 1.1504L4.8409 5.7474a.416.416 0 00-.5676-.1521.416.416 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.77h24c-.3432-4.1111-2.6889-7.5833-6.1185-9.4486"/>
        </svg>
        <span>Descargar APK (Android)</span>
      </a>

      <!-- Botón iPhone / Web PWA -->
      <a
        href="https://app.totalhiit.com"
        target="_blank"
        rel="noopener noreferrer"
        class="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl border border-zinc-700 transition-all duration-200"
      >
        <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.66-.82 1.11-1.95.99-3.08-1 .04-2.18.66-2.88 1.48-.61.71-1.14 1.87-.99 2.97 1.12.09 2.24-.57 2.88-1.37z"/>
        </svg>
        <span>Abrir PWA (iPhone / Web)</span>
      </a>
    </div>

    <p class="text-xs text-zinc-400 pt-2">
      Instalación libre y directa · Sin anuncios · Privacidad 100% protegida
    </p>
  </div>
</section>
```

---

## 2. Instrucciones para iPhone (PWA)
En el sitio web o en la app se sugiere colocar el siguiente aviso para usuarias de Apple:
> *"Si tenés un iPhone, abrí el enlace en Safari, tocá el botón **Compartir** (ícono de cuadrado con flecha hacia arriba) y elegí **'Añadir a pantalla de inicio'**. ¡Se instalará como una app nativa!"*
