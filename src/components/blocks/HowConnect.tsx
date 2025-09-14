import React, { useState } from 'react';
import Image from 'next/image';
import { useSupportOnly } from '@/context/SupportOnlyContext';

interface HowConnectProps {
  onOpenSegmentationModal?: () => void;
}

export default function HowConnect({ onOpenSegmentationModal }: HowConnectProps) {
  const { isSupportOnly } = useSupportOnly();
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const steps = [
    {
      number: 1,
      icon: "/steps/step1.svg",
      title: "Шаг 1",
      description: isSupportOnly ? (
        "Вы оставляете заявку на сайте"
      ) : (
        <>
          Вы оставляете <button className="text-[#ee3c6b] underline font-semibold hover:text-[#ff0032] transition-colors" type="button" onClick={onOpenSegmentationModal}>заявку</button> на сайте или звоните по телефону <a className="text-[#ee3c6b] font-semibold hover:text-[#ff0032] transition-colors" href="tel:88003509910">8 800 350-99-10</a>
        </>
      )
    },
    {
      number: 2,
      icon: "/steps/step2.svg",
      title: "Шаг 2",
      description: "Наш специалист связывается с вами для уточнения деталей, согласования даты и времени выезда мастера"
    },
    {
      number: 3,
      icon: "/steps/step3.svg",
      title: "Шаг 3",
      description: "В назначенное время монтажник подключает интернет и настраивает оборудование"
    }
  ];

  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      {/* Заголовок с декоративным элементом */}
      <div className="text-center mb-16 relative">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
          Как происходит подключение к{' '}
          <span className="bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] bg-clip-text text-transparent">
            МТС
          </span>
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] mx-auto rounded-full"></div>
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-r from-[#ee3c6b]/10 to-[#ff0032]/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-r from-[#8e66e4]/10 to-[#c1d8fb]/10 rounded-full blur-3xl -z-10"></div>
      </div>

      {/* Шаги подключения */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
        {/* Соединительная линия для десктопа */}
        <div className="hidden md:block absolute top-20 left-1/2 transform -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-[#ee3c6b] via-[#8e66e4] to-[#c1d8fb] rounded-full"></div>
        
        {steps.map((step, index) => (
          <div
            key={step.number}
            className="relative group"
            onMouseEnter={() => setHoveredStep(step.number)}
            onMouseLeave={() => setHoveredStep(null)}
          >
            {/* Номер шага с анимацией */}
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg transform group-hover:scale-110 transition-transform duration-300 z-10">
              {step.number}
            </div>

            {/* Карточка шага */}
            <div className={`
              bg-white rounded-2xl p-8 h-full border-2 border-transparent
              transition-all duration-300 transform
              ${hoveredStep === step.number
                ? 'border-[#ee3c6b] shadow-2xl scale-105'
                : 'shadow-lg hover:shadow-xl'
              }
              ${hoveredStep && hoveredStep !== step.number ? 'opacity-80' : 'opacity-100'}
            `}>
              {/* Иконка */}
              <div className={`
                w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center
                bg-gradient-to-br from-gray-50 to-gray-100
                transition-all duration-300
                ${hoveredStep === step.number
                  ? 'transform scale-110 bg-gradient-to-br from-[#ff0032]/10 to-[#ee3c6b]/10'
                  : ''
                }
              `}>
                <div className={`
                  w-14 h-14 bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] rounded-xl
                  flex items-center justify-center
                  transition-all duration-300
                  ${hoveredStep === step.number ? 'transform scale-110' : ''}
                `}>
                  <Image
                    width={32}
                    height={32}
                    alt={`Шаг ${step.number}`}
                    src={step.icon}
                    className="text-white filter brightness-0 invert"
                  />
                </div>
              </div>

              {/* Заголовок */}
              <h3 className="text-xl font-bold text-gray-900 text-center mb-4">
                {step.title}
              </h3>

              {/* Описание */}
              <p className="text-gray-700 text-center leading-relaxed">
                {step.description}
              </p>

              {/* Декоративный элемент при наведении */}
              {hoveredStep === step.number && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#ee3c6b]/5 to-[#ff0032]/5 -z-10"></div>
              )}
            </div>

            {/* Стрелка для мобильной версии */}
            {index < steps.length - 1 && (
              <div className="md:hidden flex justify-center my-6">
                <div className="w-8 h-8 bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Дополнительная информация */}
      <div className="text-center mt-16">
        <div className="bg-gradient-to-r from-[#8e66e4]/10 to-[#c1d8fb]/10 rounded-2xl p-8 border border-[#8e66e4]/20">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            🚀 Быстрое подключение за 24 часа
          </h3>
          <p className="text-gray-700 mb-6">
            Большинство подключений мы осуществляем в течение суток после вашей заявки
          </p>
          {!isSupportOnly && (
            <button
              onClick={onOpenSegmentationModal}
              className="bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Оставить заявку на подключение
            </button>
          )}
        </div>
      </div>
    </section>
  );
}