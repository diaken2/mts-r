import PrivacyPage from '../../privacy/page';
import { getAvailableCities, getCityData } from '@/lib/data-service';
import { notFound } from 'next/navigation';
import SetCityEffect from '@/components/layout/SetCityEffect';

export const revalidate = 3600;

export async function generateStaticParams() {
  const cities = await getAvailableCities();
  return cities.map(city => ({ city }));
}

export async function generateMetadata({ params }: { params: { city: string } }) {
  const data = await getCityData(params.city.toLowerCase());
  const name = data?.meta?.name || params.city;
  return { title: `Политика конфиденциальности МТС в ${name}` };
}

export default async function CityPolicyPage({ params }: { params: { city: string } }) {
  const data = await getCityData(params.city.toLowerCase());
  if (!data) return notFound();
  return (
    <>
      <SetCityEffect city={data.meta.name} />
      <PrivacyPage cityName={data.meta.name}  />
    </>
  );
}
