

import React, { useState, Suspense, useEffect } from "react";
import CheckPageClient from "../[city]/check/CheckPageClient";
import { getAvailableCities, getCityData } from "@/lib/data-service";
export async function generateStaticParams() {
  try {
    const cities = await getAvailableCities();
    return cities.map((city: string) => ({ city }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}
export async function generateMetadata({ params }: { params: Promise<{ city: string }> }) {
  try {
    const { city } = await params;
    const data = await getCityData(city.toLowerCase());
    const name = data?.meta?.name || city;
    return { 
      title: `Контакты официального дилера МТС в ${name}`,
      description: `Контактная информация МТС в ${name}. Телефоны, адреса, официальный дилер.`
    };
  } catch (error) {
    return { 
      title: `Контакты официального дилера МТС`,
      description: `Контактная информация МТС. Телефоны, адреса, официальный дилер.`
    };
  }
}

export default function CheckPage({cityName}:any) {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <CheckPageClient cityName={cityName} />
    </Suspense>
  );
} 