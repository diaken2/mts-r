'use client';

import React from 'react';
import OrderBlock from "@/components/blocks/OrderBlock";

export default function OrderClient({ cityTariffs = [] }: { cityTariffs?: any[] }) {
  return <OrderBlock cityTariffs={cityTariffs} />;
}