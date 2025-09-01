
import { getAvailableCities, getCityData } from '@/lib/data-service';
import { notFound } from 'next/navigation';
import SetCityEffect from '@/components/layout/SetCityEffect';
import CheckPageClient from './CheckPageClient';

export const revalidate = 3600;

export async function generateStaticParams() {
  const cities = await getAvailableCities();
  return cities.map(city => ({ city }));
}

export async function generateMetadata({ params }: { params: { city: string } }) {
  const data = await getCityData(params.city.toLowerCase());
  const name = data?.meta?.name || params.city;
  return {
    title: `Проверить возможность подключения МТС по адресу в ${name}`,
  };
}

export default async function CityCheckPage({ params }: { params: { city: string } }) {
  const data = await getCityData(params.city.toLowerCase());
  if (!data) return notFound();
  return (
    <>
      <SetCityEffect city={data.meta.name} />
      <CheckPageClient cityName={data.meta.name} />
    </>
  );
}
