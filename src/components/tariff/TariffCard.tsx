"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useSupportOnly } from '@/context/SupportOnlyContext';

interface TariffCardProps {
  tariff: any;
  onClick?: () => void;
}

export default function TariffCard({ tariff, onClick }: TariffCardProps) {
  const { isSupportOnly } = useSupportOnly();
  const [isHovered, setIsHovered] = useState(false);

  const renderPrice = () => {
    if (tariff.discountPrice !== undefined) {
      return (
        <div className="mb-5">
          <div className="flex items-baseline gap-3 mb-3">
            <span className="text-3xl font-bold text-[#ff0032]">
              {tariff.discountPrice} ₽
            </span>
            <span className="text-lg text-gray-500 line-through">
              {tariff.price} ₽
            </span>
          </div>
          <div className="inline-flex items-center bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
            🔥 -{tariff.discountPercentage}% {tariff.discountPeriod}
          </div>
        </div>
      );
    }
    return (
      <div className="text-3xl font-bold text-gray-900 mb-5">
        {tariff.price} ₽<span className="text-lg font-normal text-gray-600">/мес</span>
      </div>
    );
  };

  const renderSpecs = () => {
    const specs = [];
    
    if (tariff.speed) {
      specs.push(
        <div key="speed" className="flex items-center text-sm bg-gray-50 rounded-lg p-3">
          <div className="bg-[#ee3c6b] p-2 rounded-lg mr-3">
            <Image 
              src="/icons/ethernet.svg" 
              alt="Интернет" 
              width={20} 
              height={20} 
              className="text-white"
            />
          </div>
          <div>
            <span className="font-semibold text-gray-900">{tariff.speed} Мбит/с</span>
            <p className="text-xs text-gray-600">Скорость интернета</p>
          </div>
        </div>
      );
    }
    
    if (tariff.tvChannels) {
      specs.push(
        <div key="tv" className="flex items-center text-sm bg-gray-50 rounded-lg p-3">
          <div className="bg-[#8e66e4] p-2 rounded-lg mr-3">
            <Image 
              src="/icons/tv.svg" 
              alt="ТВ" 
              width={20} 
              height={20} 
              className="text-white"
            />
          </div>
          <div>
            <span className="font-semibold text-gray-900">{tariff.tvChannels}+ каналов</span>
            <p className="text-xs text-gray-600">Телевидение</p>
          </div>
        </div>
      );
    }
    
    if (tariff.mobileData || tariff.mobileMinutes) {
      specs.push(
        <div key="mobile" className="flex items-center text-sm bg-gray-50 rounded-lg p-3">
          <div className="bg-[#1e7bff] p-2 rounded-lg mr-3">
            <Image 
              src="/icons/mobile.svg" 
              alt="Мобильная связь" 
              width={20} 
              height={20} 
              className="text-white"
            />
          </div>
          <div>
            <span className="font-semibold text-gray-900">
              {tariff.mobileData} ГБ + {tariff.mobileMinutes} мин
            </span>
            <p className="text-xs text-gray-600">Мобильная связь</p>
          </div>
        </div>
      );
    }

    if (tariff.mtsTvIncluded) {
      specs.push(
        <div key="mts-tv" className="flex items-center text-sm bg-gray-50 rounded-lg p-3">
          <div className="bg-gradient-to-r from-[#ff0032] to-[#ee3c6b] p-2 rounded-lg mr-3">
            <Image 
              src="/icons/kion.png" 
              alt="KION" 
              width={20} 
              height={20} 
              className="text-white"
            />
          </div>
          <div>
            <span className="font-semibold text-gray-900">KION Premium</span>
            <p className="text-xs text-gray-600">Подписка включена</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="grid gap-3 mb-5">
        {specs}
      </div>
    );
  };

  return (
    <div 
      className={`
        bg-white rounded-2xl p-6 shadow-lg border border-gray-200 transition-all duration-300
        ${isHovered ? 'shadow-xl transform scale-105 border-[#ee3c6b]/20' : 'hover:shadow-xl'}
        ${!isSupportOnly && onClick ? 'cursor-pointer' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...(!isSupportOnly && onClick ? { onClick } : {})}
    >
      {/* Header with badge */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <h3 className="font-bold text-xl text-gray-900 mb-2 leading-tight">
            {tariff.name}
          </h3>
          <p className="text-gray-600 text-sm bg-gray-100 rounded-full px-3 py-1 inline-block">
            {tariff.type}
          </p>
        </div>
        
        <div className="flex flex-col gap-2 ml-4">
          {tariff.isHit && (
            <span className="bg-gradient-to-r from-[#ff0032] to-[#ee3c6b] text-white text-xs font-bold px-3 py-2 rounded-full shadow-lg transform rotate-3">
              🚀 ХИТ ПРОДАЖ
            </span>
          )}
          <span className="bg-gradient-to-r from-[#8e66e4] to-[#c1d8fb] text-white text-xs font-medium px-3 py-2 rounded-full">
            {tariff.technology}
          </span>
        </div>
      </div>
      
      {/* Характеристики */}
      {renderSpecs()}
      
      {/* Цена */}
      {renderPrice()}
      
      {/* Особенности */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-4 text-lg border-b border-gray-200 pb-2">
          Что входит в тариф:
        </h4>
        <ul className="space-y-3">
          {tariff.features.slice(0, 3).map((feature: string, index: number) => (
            <li key={index} className="flex items-start group">
              <div className="bg-green-100 p-1 rounded-full mr-3 mt-0.5 flex-shrink-0 group-hover:bg-green-200 transition-colors">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">
                {feature}
              </span>
            </li>
          ))}
          {tariff.features.length > 3 && (
            <li className="text-[#ee3c6b] text-sm font-semibold mt-3 flex items-center group">
              <div className="bg-[#ee3c6b]/10 p-1 rounded-full mr-2">
                <svg className="w-4 h-4 text-[#ee3c6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              +{tariff.features.length - 3} дополнительных услуги
            </li>
          )}
        </ul>
      </div>
      
      {/* Кнопка подключения */}
      <div className="text-center">
        {isSupportOnly ? (
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-blue-700 text-sm font-medium mb-2">Техническая поддержка</p>
            <a 
              href="tel:87501000750" 
              className="text-blue-700 font-bold text-lg hover:text-[#ee3c6b] transition-colors inline-flex items-center"
            >
              📞 8 750 100-08-00
            </a>
            <p className="text-xs text-blue-600 mt-2">Круглосуточная поддержка</p>
          </div>
        ) : (
          <>
            <button className="w-full bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              Подключить за 0 ₽
            </button>
            <div className="mt-3 text-xs text-gray-500 flex items-center justify-center">
              <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Бесплатное подключение и оборудование
            </div>
          </>
        )}
      </div>

      {/* Decorative elements */}
      {isHovered && (
        <div className="absolute inset-0 rounded-2xl border-2 border-[#ee3c6b]/30 pointer-events-none"></div>
      )}
    </div>
  );
}