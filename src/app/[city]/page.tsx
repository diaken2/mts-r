import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import CityServiceLayout from '@/components/layout/CityServiceLayout'
import { getCityData, getAvailableCities } from '@/lib/data-service'
import CityTariffExplorer from '@/components/blocks/CityTariffExplorer'

export const revalidate = 3600

export async function generateStaticParams() {
  const cities = await getAvailableCities()
  return cities.map(city => ({ city }))
}


export async function generateMetadata({ params }: { params: { city: string } }) {
  const citySlug = params.city.toLowerCase();
  const data = await getCityData(citySlug);

  if (!data) {
    return {
      title: 'Город не найден',
      description: 'Выбранный город не найден в списке обслуживания.',
    };
  }

  const cityName = data.meta.name || citySlug;
  const year = new Date().getFullYear();

  const title = `МТС в ${cityName} — тарифы MTS в ${year} году, подключить в ${cityName}`;
  const description = `Подключение МТСа в ${cityName}. Действующие тарифы на услуги МТС в ${year} году в ${cityName}. Оставьте заявку на сайте.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

export default async function CityPage({ params }: { params: { city: string } }) {
  const city = params.city.toLowerCase()
  const data = await getCityData(city)
  if (!data) return notFound()

  const tariffsData = Object.values(data.services).flatMap(s => s.tariffs)

  return (
    <CityServiceLayout service="home" cityName={data.meta.name} citySlug={city}>
      <Suspense fallback={<div className="flex justify-center items-center min-h-[400px]">Загрузка тарифов...</div>}>
        <CityTariffExplorer
          tariffs={tariffsData}
          cityName={data.meta.name}
          citySlug={city}
        />
      </Suspense>
    </CityServiceLayout>
  )
}
