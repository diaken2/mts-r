'use client'

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroAddressSearch from "@/components/blocks/HeroAddressSearch";
import CallRequestModal from "@/components/ui/CallRequestModal";
import { useSupportOnly } from "@/context/SupportOnlyContext";
import { useEffect, useState } from "react";


export default function CheckPageClient({cityName}:any) {
 const [citySlug, setCitySlug]=useState('')
  useEffect(()=>{
const slug = cityName
              .toLowerCase()
              .replace(/^(г\.|пгт|село|аул|деревня|поселок|ст-ца|п\.)\s*/i, "")
              .replace(/ё/g, "e")
              .replace(/\s+/g, "-")
              .replace(/[а-я]/g, (c: string) => {
                const map: Record<string, string> = {
                  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ж: "zh", з: "z", и: "i", й: "i",
                  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
                  х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ы: "y", э: "e", ю: "yu", я: "ya"
                };
                return map[c] || "";
              })
              .replace(/[^a-z0-9-]/g, "");
              setCitySlug(slug)
},[cityName])
  const [isCallRequestModalOpen, setIsCallRequestModalOpen] = useState(false);
  const { isSupportOnly } = useSupportOnly();

  const handleCallRequest = () => {
    setIsCallRequestModalOpen(true);
  };


  

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroAddressSearch />
      <Footer cityName={citySlug} />
      <CallRequestModal
        isOpen={isCallRequestModalOpen}
        onClose={() => setIsCallRequestModalOpen(false)}
      />
    </div>
  );
}