import React, { useState } from 'react';
import { useSupportOnly } from '@/context/SupportOnlyContext';
import Image from 'next/image';

interface PromoSliderProps {
  onOpenSegmentationModal?: () => void;
}

const promos = [
  {
    img: '/promos/velikolepnaya_chetverka.png',
    title: 'Великолепная четверка: интернет, мобильная связь, интерактивное ТВ и онлайн-кинотеатр',
    description: 'Все услуги связи в одном пакете со скидкой до 40%',
    badge: 'ХИТ',
    color: 'from-[#ee3c6b] to-[#ff0032]',
    link: '#'
  }
];

export default function PromoSlider({ onOpenSegmentationModal }: PromoSliderProps) {
  const { isSupportOnly } = useSupportOnly();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredSlide, setHoveredSlide] = useState<number | null>(null);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % promos.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + promos.length) % promos.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className="container mx-auto px-4 py-16 md:py-24 relative">
      {/* Заголовок с декоративным элементом */}
      <div className="text-center mb-16 relative">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
          Горячие{' '}
          <span className="bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] bg-clip-text text-transparent">
            акции
          </span>{' '}
          от МТС
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Специальные предложения, которые сделают вашу связь еще выгоднее
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] mx-auto rounded-full"></div>
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-r from-[#ee3c6b]/10 to-[#ff0032]/10 rounded-full blur-3xl -z-10"></div>
      </div>

      {/* Слайдер */}
      <div className="relative max-w-6xl mx-auto">
        {/* Контейнер слайдов */}
        <div className="overflow-hidden rounded-3xl">
          <div 
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {promos.map((promo, idx) => (
              <div
                key={idx}
                className="w-full flex-shrink-0"
                onMouseEnter={() => setHoveredSlide(idx)}
                onMouseLeave={() => setHoveredSlide(null)}
              >
                <div className={`
                  bg-gradient-to-br ${promo.color} rounded-3xl p-8 md:p-12
                  transform transition-all duration-500
                  ${hoveredSlide === idx ? 'scale-105' : 'scale-100'}
                `}>
                  <div className="flex flex-col md:flex-row items-center justify-between">
                    {/* Текстовый контент */}
                    <div className="flex-1 md:pr-8 mb-8 md:mb-0">
                      {/* Бейдж */}
                      {promo.badge && (
                        <span className="inline-block bg-white/20 text-white text-sm font-bold px-4 py-2 rounded-full mb-4 backdrop-blur-sm">
                          {promo.badge}
                        </span>
                      )}
                      
                      {/* Заголовок */}
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                        {promo.title}
                      </h3>
                      
                      {/* Описание */}
                      <p className="text-white/90 text-lg mb-6">
                        {promo.description}
                      </p>

                      {/* Кнопка действия */}
                      {isSupportOnly ? (
                        <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                          <p className="text-white text-sm font-medium mb-2">Для действующих абонентов</p>
                          <a 
                            href="tel:87501000750" 
                            className="text-white font-bold text-lg hover:text-gray-100 transition-colors inline-flex items-center"
                          >
                            📞 8 750 100-08-00
                          </a>
                        </div>
                      ) : (
                        <button 
                          className="bg-white text-[#ee3c6b] font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center"
                          onClick={onOpenSegmentationModal}
                        >
                          Подключить акцию
                          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Изображение */}
                 
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Навигационные кнопки */}
        {/* <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-[#ee3c6b] w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-10"
          aria-label="Предыдущий слайд"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-[#ee3c6b] w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-10"
          aria-label="Следующий слайд"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button> */}

        {/* Индикаторы слайдов */}
        <div className="flex justify-center mt-8 space-x-2">
          {promos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === idx 
                  ? 'bg-[#ee3c6b] w-8' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Перейти к слайду ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Декоративные элементы */}
      <div className="absolute right-0 top-1/4 w-64 h-64 bg-gradient-to-r from-[#8e66e4]/10 to-[#c1d8fb]/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute left-0 bottom-1/4 w-48 h-48 bg-gradient-to-r from-[#ee3c6b]/10 to-[#ff0032]/10 rounded-full blur-3xl -z-10"></div>
    </section>
  );
}