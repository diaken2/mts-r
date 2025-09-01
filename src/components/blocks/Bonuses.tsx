import React, { useState } from "react";
import Image from 'next/image';

const bonuses = [
  {
    img: "/bonuses/bonus1.png",
    title: "Копи бонусы и выбирай лучшее",
    desc: 'Стань участником программы "Бонус" от МТС и меняй бонусы на подарки!',
    color: "from-[#ee3c6b] to-[#ff0032]"
  },
  {
    img: "/bonuses/bonus2.png",
    title: "Облачное хранилище",
    desc: "Получайте +1 ТБ дополнительного места каждый месяц в облачном хранилище от МТСа",
    color: "from-[#8e66e4] to-[#959af1]"
  },
  {
    img: "/bonuses/bonus3.png",
    title: "Сервис Лицей",
    desc: "Вся школьная программа по ФГОС и развивающие курсы от лучших учителей",
    color: "from-[#1e7bff] to-[#1e4e9d]"
  },
  {
    img: "/bonuses/bonus4.png",
    title: "Умная колонка",
    desc: "Управляет сервисами KION, Умный дом от МТСа и многое другое.",
    color: "from-[#109b61] to-[#7dc65b]"
  },
  {
    img: "/bonuses/bonus5.png",
    title: "Умный дом",
    desc: "Следите за домом и будьте за него спокойны даже на расстоянии!",
    color: "from-[#ff9900] to-[#ffcc00]"
  },
  {
    img: "/bonuses/bonus6.png",
    title: "Подписка Литрес",
    desc: "Подключайтесь на специальных условиях к крупнейшему сервису электронных и аудиокниг Литрес.",
    color: "from-[#ad82f2] to-[#c1d8fb]"
  },
];
interface BonusesProps {
  onOpenSegmentationModal?: () => void;
}
const Bonuses: React.FC<BonusesProps> = ({ onOpenSegmentationModal }) => {
  const [hoveredBonus, setHoveredBonus] = useState<number | null>(null);

  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      {/* Заголовок с декоративным элементом */}
      <div className="text-center mb-16 relative">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
          Эксклюзивные{" "}
          <span className="bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] bg-clip-text text-transparent">
            бонусы
          </span>{" "}
          от МТС
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Получайте дополнительные преимущества и услуги вместе с нашими тарифами
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] mx-auto rounded-full"></div>
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-r from-[#ee3c6b]/10 to-[#ff0032]/10 rounded-full blur-3xl -z-10"></div>
      </div>

      {/* Сетка бонусов */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {bonuses.map((bonus, idx) => (
          <div
            key={idx}
            className="group relative"
            onMouseEnter={() => setHoveredBonus(idx)}
            onMouseLeave={() => setHoveredBonus(null)}
          >
            {/* Карточка бонуса */}
            <div className={`
              bg-white rounded-2xl p-6 h-full border-2 border-transparent
              transition-all duration-300 transform
              ${hoveredBonus === idx
                ? 'shadow-2xl scale-105 border-gray-100'
                : 'shadow-lg hover:shadow-xl'
              }
            `}>
              {/* Иконка с градиентным фоном */}
              <div className={`
                w-20 h-20 rounded-2xl mb-6 flex items-center justify-center
                bg-gradient-to-br ${bonus.color}
                transition-all duration-300
                ${hoveredBonus === idx ? 'transform scale-110' : ''}
              `}>
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center p-2">
                  <Image
                    src={bonus.img}
                    alt={bonus.title}
                    width={56}
                    height={56}
                    className="object-contain"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Заголовок */}
              <h3 className="font-bold text-xl text-gray-900 mb-3 leading-tight group-hover:text-[#ee3c6b] transition-colors">
                {bonus.title}
              </h3>

              {/* Описание */}
              <p className="text-gray-600 leading-relaxed mb-4">
                {bonus.desc}
              </p>

              {/* Кнопка действия */}
              <button onClick={onOpenSegmentationModal} className={`
                inline-flex items-center text-sm font-semibold
                transition-all duration-300
                ${hoveredBonus === idx
                  ? 'text-[#ee3c6b] transform translate-x-1'
                  : 'text-gray-500'
                }
              `}>
                Подробнее
                <svg 
                  className={`w-4 h-4 ml-1 transition-transform duration-300 ${
                    hoveredBonus === idx ? 'transform translate-x-1' : ''
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Декоративный элемент при наведении */}
            {hoveredBonus === idx && (
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${bonus.color}/5 -z-10`}></div>
            )}
          </div>
        ))}
      </div>

      {/* Дополнительная информация */}
      <div className="text-center mt-16">
        <div className="bg-gradient-to-r from-[#8e66e4]/10 to-[#c1d8fb]/10 rounded-2xl p-8 border border-[#8e66e4]/20">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            🎁 Все бонусы доступны сразу после подключения
          </h3>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Получите доступ ко всем преимуществам МТС с любым из наших тарифов. 
            Не нужно ждать — начинайте пользоваться сразу после подключения!
          </p>
          <button  onClick={onOpenSegmentationModal} className="bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            Подключить и получить бонусы
          </button>
        </div>
      </div>

      {/* Декоративные элементы */}
      <div className="absolute right-0 top-1/4 w-64 h-64 bg-gradient-to-r from-[#8e66e4]/10 to-[#c1d8fb]/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute left-0 bottom-1/4 w-48 h-48 bg-gradient-to-r from-[#ee3c6b]/10 to-[#ff0032]/10 rounded-full blur-3xl -z-10"></div>
    </section>
  );
};

export default Bonuses;