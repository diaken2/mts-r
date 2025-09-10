import React from "react";
import { useCity } from '@/context/CityContext';

const InfoBlockKrasnodar = () => {
  const { city } = useCity();
  const cityLabel = city && city.trim().length > 0 ? `в ${city.trim()}` : 'в России';

  const services = [
    "высокоскоростной домашний интернет",
    "телевидение до 220 каналов", 
    "онлайн-кинотеатры на платформе видеосервиса KION",
    "комплексные предложения",
    "цифровые сервисы и дополнительные опции"
  ];

  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 lg:p-16 relative overflow-hidden">
        {/* Декоративные элементы */}
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-r from-[#ee3c6b]/10 to-[#ff0032]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-r from-[#8e66e4]/10 to-[#c1d8fb]/10 rounded-full blur-3xl"></div>
        
        {/* Заголовок */}
        <div className="relative mb-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            МТС {cityLabel}:{" "}
            <span className="bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] bg-clip-text text-transparent">
              услуги, тарифы, подключение
            </span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] rounded-full"></div>
        </div>

        {/* Основной текст */}
        <div className="relative space-y-6 text-lg text-gray-700 leading-relaxed">
          <p className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-100">
            МТС — крупнейший федеральный телеком-оператор, который предоставляет услуги {cityLabel} и в других регионах страны. Широкое покрытие позволяет компании иметь техническую возможность подключения по многим адресам вашего города. Оптоволоконные технологии обеспечивают отличную скорость передачи данных — от 100 до 1024 Мбит/с.
          </p>

          {/* Список услуг */}
          <div className="bg-gradient-to-r from-[#f8f8f8] to-[#f0f0f0] p-6 rounded-2xl border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-2 h-2 bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] rounded-full mr-3"></span>
              Услуги МТС {cityLabel} включают:
            </h3>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-6 h-6 bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-1">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Информация о ценах */}
          <div className="bg-gradient-to-r from-white to-gray-50 p-6 rounded-2xl border border-gray-100">
            <p className="mb-4">
              Цена базовых тарифных планов начинается от{" "}
              <span className="bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] bg-clip-text text-transparent font-bold">
                599 руб/мес
              </span>
              , а продвинутые пакеты МТС с более высокой скоростью и максимальным количеством опций стоят до{" "}
              <span className="bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] bg-clip-text text-transparent font-bold">
                1499 руб/мес
              </span>
              . Абонентская плата зависит от скорости и услуг, которые включены в тариф.
            </p>
          </div>

          {/* Акции */}
          <div className="bg-gradient-to-r from-[#fff2f6] to-[#ffe9ef] p-6 rounded-2xl border border-[#ee3c6b]/20">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                <span className="text-white font-bold text-sm">%</span>
              </div>
              <p>
                Провайдер регулярно проводит акции для новых абонентов. Например, сейчас доступна скидка{" "}
                <span className="bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] bg-clip-text text-transparent font-bold">
                  до 10%
                </span>
                .
              </p>
            </div>
          </div>

          {/* Оборудование */}
          <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-100">
            <p className="mb-4">
              Также МТС официально предлагает своим клиентам оборудование, которое можно приобрести или взять в аренду. Роутер и ТВ-приставку вы можете просто добавить при оформлении заявки.
            </p>
          </div>

          {/* Призыв к действию */}
          <div className="bg-gradient-to-r from-[#8e66e4]/10 to-[#c1d8fb]/10 p-6 rounded-2xl border border-[#8e66e4]/20">
            <p className="text-gray-900 font-semibold">
              Все тарифы МТС {cityLabel} представлены у нас на сайте. Проверить техническую возможность, выбрать подходящий тарифный план и подключить можно онлайн за пару минут.
            </p>
          </div>
        </div>

        {/* Декоративный элемент в углу */}
        <div className="absolute top-4 right-4">
          <div className="w-16 h-16 bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] rounded-full opacity-10"></div>
        </div>
      </div>
    </section>
  );
};

export default InfoBlockKrasnodar;