import React from 'react';
import { useSupportOnly } from '@/context/SupportOnlyContext';
import Image from 'next/image';

interface PromoSliderProps {
  onOpenSegmentationModal?: () => void;
}

const promos = [
  {
    img: 'https://mts-r.ru/thumbor/rPqCRqE_ElaUOpG5a-XKh_OR0AY=/750x0/smart/mts-r.ru/media/uploads/provider/new_finance_desktop_2x_1.png',
    title: 'Скидка 10% на 3 месяца',
    description: 'Получите скидку 10% на 3 месяца с услугой автоплатёж',
    badge: 'АКЦИЯ',
    link: '#'
  }
];

export default function PromoSlider({ onOpenSegmentationModal }: PromoSliderProps) {
  const { isSupportOnly } = useSupportOnly();

  return (
    <section className="container mx-auto px-4 py-16 md:py-24 relative">
      {/* Заголовок как на сайте МТС */}
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
        Акции от МТС
      </h2>

      {/* Основной промо-блок */}
      <div className="relative max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 relative">
          <div className="flex flex-col md:flex-row">
            {/* Текстовый контент слева */}
            <div className="md:w-2/5 p-8 md:p-12 flex flex-col justify-center">
              {/* Бейдж */}
          
              
              {/* Заголовок */}
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {promos[0].title}
              </h3>
              
              {/* Описание */}
              <p className="text-gray-600 text-lg md:text-xl mb-8 leading-relaxed">
                {promos[0].description}
              </p>

              {/* Кнопка действия */}
              {isSupportOnly ? (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <p className="text-gray-700 text-base font-medium mb-2">Для действующих абонентов</p>
                  <a 
                    href="tel:88002500890" 
                    className="text-[#ff0032] font-bold text-lg hover:text-[#ee3c6b] transition-colors inline-flex items-center"
                  >
                    📞 8 800 250-08-90
                  </a>
                </div>
              ) : (
                <button 
                  className="bg-[#ff0032] text-white font-bold py-4 px-8 rounded-xl hover:bg-[#ee3c6b] transition-colors duration-300 inline-flex items-center justify-center text-lg w-full md:w-auto"
                  onClick={onOpenSegmentationModal}
                >
                  Подробнее
                </button>
              )}
            </div>

            {/* Изображение справа - большая и без градиента */}
            <div className="md:w-3/5 relative">
              <div className="absolute right-0 top-0 w-full h-full">
                <div className="relative w-full h-full">
                  <Image
                    src={promos[0].img}
                    alt={promos[0].title}
                    fill
                    className="object-cover object-right"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Декоративные элементы */}
       
      </div>
    </section>
  );
}