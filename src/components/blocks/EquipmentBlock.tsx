import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from 'next/image';

const deviceTypes = [
  { key: "router", label: "Роутеры", icon: "📶" },
  { key: "tvbox", label: "ТВ-приставки", icon: "📺" },
];

const devices = [
  {
    type: "router",
    img: "/devices/huawei-hg8120h.png",
    name: "Оптический модем без Wi-Fi",
    model: "Huawei HG8120H",
    payment: "Аренда",
    price: 30,
    period: "₽/мес",
    features: ["Гигабитный порт", "Компактный размер", "Стабильное соединение"]
  },
  {
    type: "router",
    img: "/devices/zte-h298a.png",
    name: "Роутер",
    model: "ZTE H298A",
    payment: "Аренда",
    price: 100,
    period: "₽/мес",
    features: ["Wi-Fi 5", "4 LAN порта", "Двойная антенна"]
  },
  {
    type: "router",
    img: "/devices/tp-link-td854w.png",
    name: "Роутер",
    model: "TP-Link TD854W",
    payment: "Аренда",
    price: 100,
    period: "₽/мес",
    features: ["ADSL2+", "Wi-Fi N", "Встроенный модем"]
  },
  {
    type: "router",
    img: "/devices/zte-rt-gm-4.png",
    name: "Роутер",
    model: "ZTE RT-GM-4",
    payment: "Аренда",
    price: 150,
    period: "₽/мес",
    features: ["Wi-Fi 6", "Гигабитные порты", "MU-MIMO"]
  },
  {
    type: "router",
    img: "/devices/eltex-rg-5440g-wac.png",
    name: "Роутер",
    model: "Eltex RG-5440G-Wac",
    payment: "Аренда",
    price: 150,
    period: "₽/мес",
    features: ["Двухдиапазонный", "4 антенны", "USB порт"]
  },
  {
    type: "tvbox",
    img: "/devices/kion-plus.png",
    name: "ТВ приставка",
    model: "KION+",
    payment: "Рассрочка",
    price: 335,
    period: "₽/мес",
    features: ["4K HDR", "Голосовое управление", "KION Premium"]
  },
  {
    type: "tvbox",
    img: "/devices/kion.png",
    name: "ТВ приставка",
    model: "KION",
    payment: "Аренда",
    price: 100,
    period: "₽/мес",
    features: ["Full HD", "Путь Домой", "Игровые приложения"]
  },
];

const EquipmentBlock: React.FC = () => {
  const [activeType, setActiveType] = useState("router");
  const [hoveredDevice, setHoveredDevice] = useState<number | null>(null);
  const filtered = devices.filter((d) => d.type === activeType);

  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      {/* Заголовок */}
      <div className="text-center mb-16 relative">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
          Оборудование{" "}
          <span className="bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] bg-clip-text text-transparent">
            МТС
          </span>
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Современные роутеры и ТВ-приставки для максимального комфорта
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] mx-auto rounded-full"></div>
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-r from-[#ee3c6b]/10 to-[#ff0032]/10 rounded-full blur-3xl -z-10"></div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden">
        {/* Декоративные элементы */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-r from-[#8e66e4]/10 to-[#c1d8fb]/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-r from-[#ee3c6b]/10 to-[#ff0032]/10 rounded-full blur-3xl -z-10"></div>

        {/* Переключатель типов устройств */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 rounded-2xl p-2 flex">
            {deviceTypes.map((t) => (
              <button
                key={t.key}
                className={`
                  flex items-center px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300
                  ${activeType === t.key
                    ? "bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900"
                  }
                `}
                onClick={() => setActiveType(t.key)}
              >
                <span className="mr-3 text-xl">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Слайдер оборудования */}
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={30}
          slidesPerView="auto"
          centeredSlides={false}
          keyboard={{ enabled: true }}
          breakpoints={{
            0: { slidesPerView: 1, spaceBetween: 20 },
            640: { slidesPerView: 2, spaceBetween: 24 },
            1024: { slidesPerView: 3, spaceBetween: 30 },
            1280: { slidesPerView: 4, spaceBetween: 32 },
          }}
          navigation={{
            nextEl: '.equipment-next',
            prevEl: '.equipment-prev',
          }}
          pagination={{ 
            clickable: true,
            el: '.equipment-pagination',
            type: 'bullets',
          }}
          className="relative"
        >
          {filtered.map((d, i) => (
            <SwiperSlide key={i} className="!w-[320px]">
              <div 
                className={`
                  bg-white rounded-3xl p-6 border-2 border-transparent h-full
                  transition-all duration-300 transform
                  ${hoveredDevice === i 
                    ? 'border-[#ee3c6b] shadow-2xl scale-105' 
                    : 'shadow-lg hover:shadow-xl'
                  }
                `}
                onMouseEnter={() => setHoveredDevice(i)}
                onMouseLeave={() => setHoveredDevice(null)}
              >
                {/* Изображение устройства */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-6 h-48 flex items-center justify-center">
                  <Image 
                    src={d.img} 
                    alt={d.name} 
                    width={160} 
                    height={160} 
                    className="object-contain transition-transform duration-300"
                    style={{ 
                      transform: hoveredDevice === i ? 'scale(1.1)' : 'scale(1)',
                    }}
                  />
                </div>

                {/* Информация об устройстве */}
                <div className="flex-1">
                  <span className="text-gray-500 text-sm font-medium mb-2 block">{d.name}</span>
                  <h3 className="font-bold text-xl text-gray-900 mb-3">{d.model}</h3>

                  {/* Особенности */}
                  <div className="mb-4">
                    {d.features.slice(0, 2).map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-600 mb-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] rounded-full mr-3"></div>
                        {feature}
                      </div>
                    ))}
                    {d.features.length > 2 && (
                      <div className="text-sm text-[#ee3c6b] font-medium">
                        +{d.features.length - 2} особенности
                      </div>
                    )}
                  </div>

                  {/* Цена и условия */}
                  <div className="border-t border-gray-200 pt-4">
                    <span className="text-gray-500 text-sm block mb-2">{d.payment}</span>
                    <div className="flex items-end justify-between">
                      <div className="flex items-end gap-1">
                        <span className="text-3xl font-bold text-gray-900">{d.price}</span>
                        <span className="text-lg text-gray-500 mb-1">{d.period}</span>
                      </div>
                  
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Навигация */}
        <div className="flex items-center justify-center mt-8 space-x-4">
          <button className="equipment-prev bg-white border-2 border-gray-300 w-12 h-12 rounded-full flex items-center justify-center text-gray-600 hover:border-[#ee3c6b] hover:text-[#ee3c6b] transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="equipment-pagination flex space-x-2"></div>
          
          <button className="equipment-next bg-white border-2 border-gray-300 w-12 h-12 rounded-full flex items-center justify-center text-gray-600 hover:border-[#ee3c6b] hover:text-[#ee3c6b] transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Дополнительная информация */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-[#f8f8f8] to-[#f0f0f0] rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              🚚 Бесплатная доставка и установка
            </h3>
            <p className="text-gray-600">
              Все оборудование доставляется и настраивается нашими специалистами абсолютно бесплатно
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EquipmentBlock;