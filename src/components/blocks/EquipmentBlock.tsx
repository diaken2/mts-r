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
    img: "/devices/zte-zxhn-670.webp",
    name: "Оптический модем с Wi-Fi",
    model: "ZTE ZXHN 670",
    payment: "Рассрочка",
    price: 240,
    period: "₽/мес",
    features: []
  },
  {
    type: "router",
    img: "/devices/tp-link-archer-c5-pro.webp",
    name: "Роутер",
    model: "TP-Link Archer C5 Pro",
    payment: "Рассрочка",
    price: 135,
    period: "₽/мес",
    features: []
  },
  {
    type: "router",
    img: "/devices/tp-link-ex220.webp",
    name: "Роутер",
    model: "TP-Link EX220",
    payment: "Рассрочка",
    price: 200,
    period: "₽/мес",
    features: []
  },
   {
    type: "router",
    img: "/devices/tp-link-ex220.webp",
    name: "Роутер",
    model: "TP-Link EX220 (Б/У)",
    payment: "Рассрочка",
    price: 135,
    period: "₽/мес",
    features: []
  },
   {
    type: "router",
    img: "/devices/zte-zxhn-670.webp",
    name: "Оптический модем с Wi-Fi",
    model: "ZTE ZXHN 670 (Б/У)",
    payment: "Покупка",
    price: 2400,
    period: "₽",
    features: []
  },
   {
    type: "router",
    img: "/devices/tp-link-archer-c5-pro.webp",
    name: "Роутер",
    model: "TP-Link Archer C5 Pro (Б/У)",
    payment: "Покупка",
    price: 2400,
    period: "₽",
    features: []
  },
  {
    type: "tvbox",
    img: "/devices/sdmc-dv9135.webp",
    name: "ТВ приставка",
    model: "SDMC DV9135",
    payment: "Рассрочка",
    price: 350,
    period: "₽/мес",
    features: []
  }
];


const EquipmentBlock: React.FC = () => {
  const [activeType, setActiveType] = useState("router");
  const filtered = devices.filter((d) => d.type === activeType);

  return (
    <section className="bg-[#f7f7f9] my-8">
      <div className="max-w-7xl mx-auto px-4 py-8 bg-white rounded-3xl shadow">
        <div className="mb-6">
          <h2 className="text-[34px] font-bold mb-2">Оборудование</h2>
          <p className="text-[18px] text-gray-500 mb-6">Доступные Wi-Fi роутеры и ТВ-приставки</p>
        </div>
        <div className="flex gap-4 mb-8">
          {deviceTypes.map((t) => (
            <button
              key={t.key}
              className={`px-6 py-2 rounded-full border-2 font-medium transition text-[14px] min-w-[140px] focus:outline-none ${
                activeType === t.key
                  ? "bg-[#ee3c6b] border-[#ee3c6b] text-white shadow-md"
                  : "bg-white border-[#ee3c6b] text-[#ee3c6b]"
              }`}
              onClick={() => setActiveType(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={24}
          slidesPerView="auto"
          centeredSlides={false}
          keyboard={{ enabled: true }}
          breakpoints={{
            0: { slidesPerView: 1, spaceBetween: 16 },
            480: { slidesPerView: "auto", spaceBetween: 24 },
          }}
          navigation
          pagination={{ clickable: true }}
          className="equipment-carousel pb-8"
        >
          {filtered.map((d, i) => (
            <SwiperSlide key={i} className="!w-[280px]">
              <div className="flex flex-col h-full bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
                <div className="mb-6 flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-200 h-44">
                  <Image src={d.img} alt={d.name} className="h-36 object-contain mx-auto" width={144} height={144} />
                </div>
                <div className="flex-1 flex flex-col">
                  <span className="text-gray-500 text-lg mb-1">{d.name}</span>
                  <div className="font-bold text-2xl mb-2">{d.model}</div>
                  <span className="text-gray-400 text-base mb-1">{d.payment}</span>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold">{d.price}</span>
                    <span className="text-lg text-gray-500">{d.period}</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default EquipmentBlock;
