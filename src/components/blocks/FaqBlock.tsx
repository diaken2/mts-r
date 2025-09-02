import React, { useState } from "react";
import { useCity } from '@/context/CityContext';

const FaqBlock = () => {
  const { city } = useCity();
  const cityLabel = city && city.trim().length > 0 ? `в ${city.trim()}` : 'в России';
  const [open, setOpen] = useState<number | null>(null);

  const faq = [
    {
      question: `Как подключить МТС ${cityLabel}?`,
      answer: (
        <>
          МТС предоставляет широкий спектр услуг для физических лиц. Для подключения достаточно оставить заявку на сайте. Заполните форму онлайн за пару минут: укажите тариф, необходимое оборудование, удобное время и день для приезда мастера, а также свой контактный номер. Специалисты быстро обработают ваш запрос и, при необходимости, свяжутся уточнить детали.
        </>
      ),
      icon: "📋"
    },
    {
      question: `Какие услуги МТС предоставляет ${cityLabel}?`,
      answer: (
        <>
          МТС предоставляет полный спектр телекоммуникационных услуг, включая скоростной интернет до 650 Мбит/с и телевидение до 200 каналов. Вы можете выбрать подходящий тарифный план, который будет соответствовать вашим требованиям и бюджету.
        </>
      ),
      icon: "🎯"
    },
    {
      question: `Сколько стоит ${cityLabel} подключить МТС?`,
      answer: (
        <>
          Стоимость зависит от наполнения тарифного плана и его характеристик. Можно подобрать вариант под любой бюджет. Недорогие предложения в вашем городе начинаются от{" "}
          <span className="bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] bg-clip-text text-transparent font-bold">
            599 руб/мес
          </span>{" "}
          — они включают себя базовые параметры и минимальную скорость соединения в вашем городе. Более скоростные, а также пакетные тарифы с комплексом услуг могут стоить до{" "}
          <span className="bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] bg-clip-text text-transparent font-bold">
            1499 руб/мес
          </span>.
        </>
      ),
      icon: "💰"
    },
    {
      question: "Как проверить возможность подключения МТС в моем доме?",
      answer: (
        <>
          Чтобы узнать, возможно ли подключение МТС в вашем доме, воспользуйтесь онлайн-проверкой: введите свой адрес на этой странице в специальной форме. Если система показала отсутствие технической возможности, обратитесь в{" "}
          <a 
            href="https://mts.ru/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-[#ee3c6b] underline font-semibold hover:text-[#ff0032] transition-colors"
          >
            службу поддержки клиентов MTS
          </a>{" "}
          для получения консультации.
        </>
      ),
      icon: "🔍"
    },
  ];

  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      {/* Заголовок */}
      <div className="text-center mb-16 relative">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
          Часто задаваемые{" "}
          <span className="bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] bg-clip-text text-transparent">
            вопросы
          </span>
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Все, что вам нужно знать о подключении и услугах МТС
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] mx-auto rounded-full"></div>
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-r from-[#ee3c6b]/10 to-[#ff0032]/10 rounded-full blur-3xl -z-10"></div>
      </div>

      {/* FAQ аккордеон */}
      <div className="max-w-4xl mx-auto">
        <div className="space-y-4">
          {faq.map((item, idx) => (
            <div
              key={idx}
              className={`
                bg-white rounded-2xl border-2 transition-all duration-300
                ${open === idx 
                  ? 'border-[#ee3c6b] shadow-2xl' 
                  : 'border-gray-200 shadow-lg hover:shadow-xl hover:border-gray-300'
                }
              `}
            >
              <button
                className="w-full flex items-center justify-between px-6 py-5 text-left focus:outline-none group"
                onClick={() => setOpen(open === idx ? null : idx)}
                aria-expanded={open === idx}
              >
                <div className="flex items-center space-x-4">
                
                  <span className={`
                    text-lg font-semibold transition-colors duration-300
                    ${open === idx 
                      ? 'text-gray-900' 
                      : 'text-gray-700 group-hover:text-gray-900'
                    }
                  `}>
                    {item.question}
                  </span>
                </div>
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  transition-all duration-300
                  ${open === idx 
                    ? 'bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] text-white rotate-180' 
                    : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                  }
                `}>
                  <svg
                    className="w-5 h-5 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              <div
                className={`
                  transition-all duration-300 overflow-hidden
                  ${open === idx ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
                `}
              >
                <div className="px-6 pb-6">
                  <div className={`
                    pl-16 text-gray-700 leading-relaxed border-l-2
                    transition-all duration-300
                    ${open === idx 
                      ? 'border-[#ee3c6b] opacity-100' 
                      : 'border-transparent opacity-0'
                    }
                  `}>
                    {item.answer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Дополнительная информация */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-[#8e66e4]/10 to-[#c1d8fb]/10 rounded-2xl p-8 border border-[#8e66e4]/20">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              💬 Не нашли ответ на свой вопрос?
            </h3>
            <p className="text-gray-700 mb-6">
              Наша служба поддержки всегда готова помочь вам с любыми вопросами
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:87501000750" 
                className="bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center justify-center"
              >
                📞 8 750 100-08-00
              </a>
             
            </div>
          </div>
        </div>
      </div>

      {/* Декоративные элементы */}
      <div className="absolute right-0 top-1/4 w-64 h-64 bg-gradient-to-r from-[#8e66e4]/10 to-[#c1d8fb]/10 rounded-full blur-3xl -z-10"></div>
    </section>
  );
};

export default FaqBlock;