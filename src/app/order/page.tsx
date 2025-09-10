import OrderClient from "./OrderClient";

export async function generateMetadata({ params }: { params: { city: string } }) {
  return { title: `Заявка на подключение к МТС — подать заявку онлайн в МТС.` };
}

export default function OrderPage({ cityTariffs = [] }: { cityTariffs?: any[] }) {
 
  return <OrderClient cityTariffs={cityTariffs} />;
}