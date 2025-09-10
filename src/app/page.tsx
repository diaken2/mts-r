
"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TariffCard from "@/components/tariff/TariffCard";
import ContactModal from "@/components/forms/ContactModal";
import ConnectionForm from "@/components/forms/ConnectionForm";
import HeroAddressSearch from "@/components/blocks/HeroAddressSearch";
import MobileFiltersDrawer from "@/components/filters/MobileFiltersDrawer";
import { FiFilter } from "react-icons/fi";
import 'rc-slider/assets/index.css';
import Slider from 'rc-slider';
import SegmentationModal from '@/components/ui/SegmentationModal';
import CallRequestModal from '@/components/ui/CallRequestModal';
import HowConnect from '@/components/blocks/HowConnect';
import Bonuses from '@/components/blocks/Bonuses';
import PromoSlider from '@/components/blocks/PromoSlider';
import EquipmentBlock from '@/components/blocks/EquipmentBlock';
import QuestionsBlock from '@/components/blocks/QuestionsBlock';
import InfoBlockKrasnodar from '@/components/blocks/InfoBlockKrasnodar';
import FaqBlock from "../components/blocks/FaqBlock";
import SupportOnlyBlock from '@/components/ui/SupportOnlyBlock';
import InputMask from "react-input-mask";
import { submitLead } from '@/lib/submitLead';
import { useSupportOnly } from '@/context/SupportOnlyContext';

// Полные данные тарифов (оставляем как есть)
const tariffsData = [
  {
    id: 1,
    name: "МТС Домашний интернет 300",
    type: "Интернет",
    speed: 300,
    technology: "GPON",
    price: 750,
    features: [
      "KION на 180 дней (20 000 фильмов и сериалов)",
      "Wi-Fi роутер — 120 ₽/мес в аренду",
      "+10 ГБ облачного хранилища от Mail.ru"
    ],
    buttonColor: "orange"
  },
  {
    id: 2,
    name: "МТС Домашний интернет 100",
    type: "Интернет",
    speed: 100,
    technology: "FTTB",
    price: 650,
    discountPrice: 0,
    discountPeriod: "первый месяц",
    discountPercentage: 100,
    features: [
      "KION на 180 дней (20 000 фильмов и сериалов)",
      "Wi-Fi роутер — 80 ₽/мес в аренду",
      "+10 ГБ облачного хранилища от Mail.ru",
      "Оборудование и услуга «Гарантия+» бесплатно 1 месяц"
    ],
    buttonColor: "purple"
  },
  {
    id: 3,
    name: "Технологии развлечения Макси 300",
    type: "Интернет + ТВ",
    speed: 300,
    technology: "GPON",
    tvChannels: 210,
    price: 850,
    features: [
      "KION (20 000 фильмов и сериалов)",
      "Wi-Fi роутер — 120 ₽/мес в аренду",
      "+10 ГБ облачного хранилища от Mail.ru"
    ],
    buttonColor: "orange"
  },
  {
    id: 4,
    name: "Технологии развлечения Тест-драйв",
    type: "Интернет + ТВ",
    speed: 100,
    technology: "FTTB",
    tvChannels: 210,
    price: 750,
    discountPrice: 0,
    discountPeriod: "первый месяц",
    discountPercentage: 100,
    features: [
      "KION (20 000 фильмов и сериалов)",
      "Wi-Fi роутер — 80 ₽/мес в аренду",
      "+10 ГБ облачного хранилища от Mail.ru",
      "Оборудование и услуга «Гарантия+» бесплатно 1 месяц"
    ],
    buttonColor: "purple"
  },
  {
    id: 5,
    name: "Технологии выгоды Тест-драйв",
    type: "Интернет + ТВ + Моб. связь",
    speed: 250,
    technology: "GPON",
    tvChannels: 210,
    mobileData: 40,
    mobileMinutes: 1000,
    price: 950,
    discountPrice: 0,
    discountPeriod: "первый месяц",
    discountPercentage: 100,
    features: [
      "KION (20 000 фильмов и сериалов)",
      "Wi-Fi роутер — 120 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam",
      "Перенос остатков минут и ГБ"
    ],
    isHit: true,
    buttonColor: "purple"
  },
  {
    id: 6,
    name: "МТС Домашний интернет 100",
    type: "Интернет",
    speed: 200,
    technology: "GPON",
    price: 650,
    discountPrice: 0,
    discountPeriod: "первый месяц",
    discountPercentage: 100,
    features: [
      "KION на 180 дней (20 000 фильмов и сериалов)",
      "Wi-Fi роутер — 120 ₽/мес в аренду",
      "+10 ГБ облачного хранилища от Mail.ru",
      "Оборудование и услуга «Гарантия+» бесплатно 1 месяц"
    ],
    isHit: true,
    buttonColor: "purple"
  },
  {
    id: 7,
    name: "Технологии развлечения Тест-драйв",
    type: "Интернет + ТВ",
    speed: 200,
    technology: "GPON",
    tvChannels: 210,
    price: 750,
    discountPrice: 0,
    discountPeriod: "первый месяц",
    discountPercentage: 100,
    features: [
      "KION на 180 дней (20 000 фильмов и сериалов)",
      "Wi-Fi роутер — 120 ₽/мес в аренду",
      "+10 ГБ облачного хранилища от Mail.ru",
      "Оборудование и услуга «Гарантия+» бесплатно 1 месяц"
    ],
    isHit: true,
    buttonColor: "purple"
  },
  {
    id: 8,
    name: "Технологии общения Тест-драйв",
    type: "Интернет + Моб. связь",
    speed: 250,
    technology: "GPON",
    mobileData: 40,
    mobileMinutes: 1000,
    price: 750,
    discountPrice: 0,
    discountPeriod: "первый месяц",
    discountPercentage: 100,
    features: [
      "KION на 180 дней (20 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 120 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam"
    ],
    isHit: true,
    buttonColor: "purple"
  },
  {
    id: 9,
    name: "Технологии общения Семейный",
    type: "Интернет + Моб. связь",
    speed: 500,
    technology: "GPON",
    mobileData: 40,
    mobileMinutes: 2000,
    price: 950,
    discountPrice: 475,
    discountPeriod: "первые 2 месяца",
    discountPercentage: 50,
    features: [
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 120 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam"
    ],
    buttonColor: "purple"
  },
  {
    id: 10,
    name: "Технологии общения Тест-драйв",
    type: "Интернет + Моб. связь",
    speed: 100,
    technology: "FTTB",
    mobileData: 40,
    mobileMinutes: 1000,
    price: 750,
    discountPrice: 0,
    discountPeriod: "первый месяц",
    discountPercentage: 100,
    features: [
      "KION на 180 дней (20 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 120 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam"
    ],
    buttonColor: "purple"
  },
  {
    id: 11,
    name: "Технологии развлечения Макси 500",
    type: "Интернет + ТВ",
    speed: 500,
    technology: "GPON",
    tvChannels: 210,
    price: 950,
    features: [
      "KION (20 000 фильмов и сериалов)",
      "Wi-Fi роутер — 120 ₽/мес в аренду",
      "+10 ГБ облачного хранилища от Mail.ru"
    ],
    buttonColor: "orange"
  },
  {
    id: 12,
    name: "Игровой",
    type: "Интернет + ТВ",
    speed: 650,
    technology: "GPON",
    tvChannels: 210,
    price: 1150,
    features: [
      "KION (20 000 фильмов и сериалов)",
      "Wi-Fi роутер — 120 ₽/мес в аренду",
      "Бонусы в играх от 4GAME",
      "Бонусы в играх от VK Play",
      "Бонусы в играх от Леста Игры"
    ],
    buttonColor: "orange"
  },
  {
    id: 13,
    name: "Технологии доступа Макси 500",
    type: "Интернет",
    speed: 500,
    technology: "GPON",
    price: 900,
    features: [
      "KION на 180 дней (20 000 фильмов и сериалов)",
      "Wi-Fi роутер — 120 ₽/мес в аренду",
      "+10 ГБ облачного хранилища от Mail.ru"
    ],
    buttonColor: "orange"
  },
  {
    id: 14,
    name: "Технологии выгоды Тест-драйв",
    type: "Интернет + ТВ + Моб. связь",
    speed: 100,
    technology: "FTTB",
    tvChannels: 210,
    mobileData: 40,
    mobileMinutes: 1000,
    price: 950,
    discountPrice: 0,
    discountPeriod: "первый месяц",
    discountPercentage: 100,
    features: [
      "KION (20 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 80 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam"
    ],
    buttonColor: "purple"
  },
  {
    id: 15,
    name: "Игровой",
    type: "Интернет",
    speed: 650,
    technology: "GPON",
    price: 950,
    features: [
      "KION на 180 дней (20 000 фильмов и сериалов)",
      "Бонусы в играх от 4GAME",
      "Бонусы в играх от VK Play",
      "Бонусы в играх от Леста Игры",
      "Wi-Fi роутер — 120 ₽/мес в аренду"
    ],
    buttonColor: "orange"
  },
  {
    id: 16,
    name: "Технологии развлечения Макси 300",
    type: "Интернет + ТВ",
    speed: 300,
    technology: "FTTB",
    tvChannels: 210,
    price: 850,
    features: [
      "KION (20 000 фильмов и сериалов)",
      "Wi-Fi роутер — 80 ₽/мес в аренду",
      "+10 ГБ облачного хранилища от Mail.ru"
    ],
    buttonColor: "orange"
  },
  {
    id: 17,
    name: "Технологии общения Тест-драйв",
    type: "Интернет + Моб. связь",
    speed: 250,
    technology: "GPON",
    mobileData: 40,
    mobileMinutes: 2000,
    price: 950,
    discountPrice: 0,
    discountPeriod: "первый месяц",
    discountPercentage: 100,
    features: [
      "KION на 180 дней (20 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 120 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam"
    ],
    buttonColor: "purple"
  },
  {
    id: 18,
    name: "Технологии выгоды Семейный",
    type: "Интернет + ТВ + Моб. связь",
    speed: 500,
    technology: "GPON",
    tvChannels: 210,
    mobileData: 40,
    mobileMinutes: 2000,
    price: 1200,
    discountPrice: 600,
    discountPeriod: "первые 2 месяца",
    discountPercentage: 50,
    features: [
      "KION (20 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 120 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam"
    ],
    buttonColor: "purple"
  },
  {
    id: 19,
    name: "Технологии развлечения Макси 500",
    type: "Интернет + ТВ",
    speed: 500,
    technology: "FTTB",
    tvChannels: 210,
    price: 950,
    features: [
      "KION (20 000 фильмов и сериалов)",
      "Wi-Fi роутер — 80 ₽/мес в аренду",
      "+10 ГБ облачного хранилища от Mail.ru"
    ],
    buttonColor: "orange"
  },
  {
    id: 20,
    name: "Технологии выгоды Тест-драйв",
    type: "Интернет + ТВ + Моб. связь",
    speed: 250,
    technology: "GPON",
    tvChannels: 210,
    mobileData: 40,
    mobileMinutes: 2000,
    price: 1200,
    discountPrice: 0,
    discountPeriod: "первый месяц",
    discountPercentage: 100,
    features: [
      "KION (20 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 120 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam"
    ],
    buttonColor: "purple"
  },
  {
    id: 21,
    name: "Технологии доступа Макси 500",
    type: "Интернет",
    speed: 500,
    technology: "FTTB",
    price: 900,
    features: [
      "KION на 180 дней (20 000 фильмов и сериалов)",
      "Wi-Fi роутер — 80 ₽/мес в аренду",
      "+10 ГБ облачного хранилища от Mail.ru"
    ],
    buttonColor: "orange"
  },
  {
    id: 22,
    name: "Технологии общения Тест-драйв",
    type: "Интернет + Моб. связь",
    speed: 100,
    technology: "FTTB",
    mobileData: 40,
    mobileMinutes: 1000,
    price: 750,
    discountPrice: 0,
    discountPeriod: "первый месяц",
    discountPercentage: 100,
    features: [
      "KION на 180 дней (20 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 80 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam"
    ],
    buttonColor: "purple"
  },
  {
    id: 23,
    name: "Технологии выгоды Тест-драйв",
    type: "Интернет + ТВ + Моб. связь",
    speed: 100,
    technology: "FTTB",
    tvChannels: 210,
    mobileData: 40,
    mobileMinutes: 1000,
    price: 950,
    discountPrice: 0,
    discountPeriod: "первый месяц",
    discountPercentage: 100,
    features: [
      "KION (20 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 80 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam"
    ],
    buttonColor: "purple"
  },
  {
    id: 24,
    name: "Игровой",
    type: "Интернет + ТВ",
    speed: 500,
    technology: "FTTB",
    tvChannels: 210,
    price: 1150,
    features: [
      "KION (20 000 фильмов и сериалов)",
      "Wi-Fi роутер — 80 ₽/мес в аренду",
      "Бонусы в играх от 4GAME",
      "Бонусы в играх от VK Play",
      "Бонусы в играх от Леста Игры"
    ],
    buttonColor: "orange"
  },
  {
    id: 25,
    name: "Игровой",
    type: "Интернет",
    speed: 500,
    technology: "FTTB",
    price: 950,
    features: [
      "KION на 180 дней (20 000 фильмов и сериалов)",
      "Wi-Fi роутер — 80 ₽/мес в аренду",
      "Бонусы в играх от 4GAME",
      "Бонусы в играх от VK Play",
      "Бонусы в играх от Леста Игры"
    ],
    buttonColor: "orange"
  },
  {
    id: 26,
    name: "Игровой 4в1",
    type: "Интернет + ТВ + Моб. связь",
    speed: 650,
    technology: "GPON",
    tvChannels: 210,
    mobileData: 40,
    mobileMinutes: 1000,
    price: 1400,
    features: [
      "KION (20 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 120 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam",
      "Бонусы в играх от 4GAME",
      "Бонусы в играх от VK Play",
      "Бонусы в играх от Леста Игры"
    ],
    buttonColor: "orange"
  },
  {
    id: 27,
    name: "Игровой 2в1",
    type: "Интернет + Моб. связь",
    speed: 650,
    technology: "GPON",
    mobileData: 40,
    mobileMinutes: 1000,
    price: 1200,
    features: [
      "KION на 180 дней (20 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 120 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam",
      "Бонусы в играх от 4GAME",
      "Бонусы в играх от VK Play",
      "Бонусы в играх от Леста Игры"
    ],
    buttonColor: "orange"
  },
  {
    id: 28,
    name: "Технологии общения Семейный",
    type: "Интернет + Моб. связь",
    speed: 100,
    technology: "FTTB",
    mobileData: 40,
    mobileMinutes: 2000,
    price: 950,
    discountPrice: 475,
    discountPeriod: "первые 2 месяца",
    discountPercentage: 50,
    features: [
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 80 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam"
    ],
    buttonColor: "purple"
  },
  {
    id: 29,
    name: "Технологии общения Тест-драйв",
    type: "Интернет + Моб. связь",
    speed: 100,
    technology: "FTTB",
    mobileData: 40,
    mobileMinutes: 2000,
    price: 950,
    discountPrice: 0,
    discountPeriod: "первый месяц",
    discountPercentage: 100,
    features: [
      "KION на 180 дней (20 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 80 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam"
    ],
    buttonColor: "purple"
  },
  {
    id: 30,
    name: "Технологии выгоды Семейный",
    type: "Интернет + ТВ + Моб. связь",
    speed: 100,
    technology: "FTTB",
    tvChannels: 210,
    mobileData: 40,
    mobileMinutes: 2000,
    price: 1200,
    discountPrice: 600,
    discountPeriod: "первые 2 месяца",
    discountPercentage: 50,
    features: [
      "KION (20 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 80 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam"
    ],
    buttonColor: "purple"
  },
  {
    id: 31,
    name: "Технологии выгоды+ Тест-драйв",
    type: "Интернет + ТВ + Моб. связь",
    speed: 100,
    technology: "FTTB",
    tvChannels: 210,
    mobileData: 40,
    mobileMinutes: 2000,
    price: 1200,
    discountPrice: 0,
    discountPeriod: "первый месяц",
    discountPercentage: 100,
    features: [
      "KION (20 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 80 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam"
    ],
    buttonColor: "purple"
  },
  {
    id: 32,
    name: "Технологии общения+",
    type: "Интернет + Моб. связь",
    speed: 100,
    technology: "FTTB",
    mobileData: 40,
    mobileMinutes: 1000,
    price: 950,
    features: [
      "KION на 180 дней (20 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 80 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam"
    ],
    buttonColor: "orange"
  },
  {
    id: 33,
    name: "Игровой 4в1+",
    type: "Интернет + ТВ + Моб. связь",
    speed: 650,
    technology: "GPON",
    tvChannels: 210,
    mobileData: 40,
    mobileMinutes: 2000,
    price: 1600,
    features: [
      "KION (20 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 120 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam",
      "Бонусы в играх от 4GAME",
      "Бонусы в играх от VK Play",
      "Бонусы в играх от Леста Игры"
    ],
    buttonColor: "orange"
  },
  {
    id: 34,
    name: "Игровой 2в1+",
    type: "Интернет + Моб. связь",
    speed: 650,
    technology: "GPON",
    mobileData: 40,
    mobileMinutes: 1000,
    price: 1400,
    features: [
      "KION на 180 дней (20 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 120 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam",
      "Бонусы в играх от 4GAME",
      "Бонусы в играх от VK Play",
      "Бонусы в играх от Леста Игры"
    ],
    buttonColor: "orange"
  },
  {
    id: 35,
    name: "Игровой 4в1",
    type: "Интернет + ТВ + Моб. связь",
    speed: 500,
    technology: "FTTB",
    tvChannels: 210,
    mobileData: 40,
    mobileMinutes: 1000,
    price: 1400,
    features: [
      "KION (20 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 80 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam",
      "Бонусы в играх от 4GAME",
      "Бонусы в играх от VK Play",
      "Бонусы в играх от Леста Игры"
    ],
    buttonColor: "orange"
  },
  {
    id: 36,
    name: "Игровой 2в1+",
    type: "Интернет + Моб. связь",
    speed: 650,
    technology: "GPON",
    mobileData: 40,
    mobileMinutes: 1000,
    price: 1400,
    features: [
      "KION на 180 дней (20 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 120 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam",
      "Бонусы в играх от 4GAME",
      "Бонусы в играх от VK Play",
      "Бонусы в играх от Леста Игры"
    ],
    buttonColor: "orange"
  },
  {
    id: 37,
    name: "Игровой 2в1",
    type: "Интернет + Моб. связь",
    speed: 500,
    technology: "FTTB",
    mobileData: 40,
    mobileMinutes: 1000,
    price: 1200,
    features: [
      "KION на 180 дней (20 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 80 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam",
      "Бонусы в играх от 4GAME",
      "Бонусы в играх от VK Play",
      "Бонусы в играх от Леста Игры"
    ],
    buttonColor: "orange"
  },
  {
    id: 38,
    name: "Игровой 4в1+",
    type: "Интернет + ТВ + Моб. связь",
    speed: 500,
    technology: "FTTB",
    tvChannels: 210,
    mobileData: 40,
    mobileMinutes: 2000,
    price: 1600,
    features: [
      "KION (20 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 80 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam",
      "Бонусы в играх от 4GAME",
      "Бонусы в играх от VK Play",
      "Бонусы в играх от Леста Игры"
    ],
    buttonColor: "orange"
  },
  {
    id: 39,
    name: "Игровой 2в1+",
    type: "Интернет + Моб. связь",
    speed: 500,
    technology: "FTTB",
    mobileData: 40,
    mobileMinutes: 1000,
    price: 1400,
    features: [
      "KION на 180 дней (20 000 фильмов и сериалов)",
      "Перенос остатков минут и ГБ",
      "Wi-Fi роутер — 80 ₽/мес в аренду",
      "Бесплатный доступ к Одноклассники и ВКонтакте",
      "Бесплатный доступ к мессенджерам WhatsApp, Telegram, TamTam",
      "Бонусы в играх от 4GAME",
      "Бонусы в играх от VK Play",
      "Бонусы в играх от Леста Игры"
    ],
    buttonColor: "orange"
  }
];



const defaultFilters = {
  internet: false,
  tv: false,
  mobile: false,
  onlineCinema: false,
  gameBonuses: false,
  promotions: false,
  freeInstallation: false,
  wifiRouter: false,
  hitsOnly: false,
  connectionType: "apartment",
  priceRange: [300, 1650],
  speedRange: [50, 1000],
};

const getServiceFiltersForCategory = (categoryId: string) => {
  switch (categoryId) {
    case "internet":
      return { internet: true, tv: false, mobile: false };
    case "internet-tv":
      return { internet: true, tv: true, mobile: false };
    case "internet-mobile":
      return { internet: true, tv: false, mobile: true };
    case "internet-tv-mobile":
      return { internet: true, tv: true, mobile: true };
    default:
      return { internet: false, tv: false, mobile: false };
  }
};

function getInitialFilters(searchParams: any): typeof defaultFilters {
  const urlCategory = searchParams.get("filter") || "all";
  if (urlCategory === "all") {
    return defaultFilters;
  }
  return {
    ...defaultFilters,
    ...getServiceFiltersForCategory(urlCategory),
  };
}

// Фильтрация по категориям (строгая реализация)
const isTariffInCategory = (tariff: any, categoryId: string): boolean => {
  switch (categoryId) {
    case "internet":
      return tariff.type === "Интернет";
    case "internet-tv":
      return tariff.type === "Интернет + ТВ";
    case "internet-mobile":
      return tariff.type === "Интернет + Моб. связь";
    case "internet-tv-mobile":
      // Строгая проверка для комбинированной категории
      const hasInternet = tariff.speed > 0;
      const hasTV = (tariff.tvChannels || 0) > 0;
      const hasMobile = (tariff.mobileData || 0) > 0 || (tariff.mobileMinutes || 0) > 0;
      
      // Основной критерий - наличие всех трех услуг
      if (hasInternet && hasTV && hasMobile) return true;
      
      // Резервный критерий - только для тарифов с типом "Интернет + ТВ + Моб. связь"
      if (tariff.type === "Интернет + ТВ + Моб. связь") {
        const categoryKeywords = ['выгоды', 'семейный', 'игровой', 'комбинированный', 'тест-драйв'];
        if (categoryKeywords.some(keyword => tariff.name.toLowerCase().includes(keyword))) {
          return true;
        }
      }
      
      // Дополнительная проверка для тарифов "Тест-драйв" с комбинированными услугами
      if (tariff.name.toLowerCase().includes('тест-драйв')) {
        const hasAnyTV = tariff.type.includes('ТВ') || (tariff.tvChannels || 0) > 0;
        const hasAnyMobile = tariff.type.includes('Моб. связь') || (tariff.mobileData || 0) > 0 || (tariff.mobileMinutes || 0) > 0;
        if (hasInternet && hasAnyTV && hasAnyMobile) return true;
      }
      
      return false;
    default:
      return true; // "all"
  }
};

const houseTypes = ["Квартира", "Частный дом", "Офис"];
const supportOptions = [
  "Оплата услуг",
  "Оборудование",
  "Не работает интернет/ТВ"
];

type TimeSlot = {
  value: string;
  label: string;
};

function TariffHelpForm() {
  const [step, setStep] = React.useState<null | 'connection' | 'support'>(null);
  const [houseType, setHouseType] = React.useState(houseTypes[0]);
  const [phone, setPhone] = React.useState("");
  const [name, setName] = React.useState("");
  const [supportValue, setSupportValue] = React.useState<string | null>(null);
  const isFormValid = phone.replace(/\D/g, "").length === 10 && name.trim().length > 1;
  const [submitted, setSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const { setSupportOnly } = useSupportOnly();

  const [callTime, setCallTime] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [shouldOpenUp, setShouldOpenUp] = useState(false);
  const timeDropdownRef = useRef<HTMLDivElement>(null);

  // Генерация временных слотов
  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const slots: TimeSlot[] = [];

    // Определяем рабочее время (6:00-21:00)
    const isWorkingHours = currentHour >= 6 && currentHour < 21;

    if (!isWorkingHours) {
      slots.push({
        value: 'out-of-hours',
        label: 'Перезвоним в рабочее время'
      });
      
      for (let hour = 6; hour <= 11; hour++) {
        slots.push({
          value: `tomorrow-${hour}`,
          label: `Завтра ${hour}:00-${hour + 1}:00`
        });
      }
      
      setTimeSlots(slots);
      setCallTime('out-of-hours');
      return;
    }

    // Рабочее время
    slots.push({
      value: 'asap',
      label: 'Перезвоним в течение 15 минут'
    });

    let slotHour = currentHour;
    let slotMinute = Math.ceil(currentMinute / 15) * 15;
    
    if (slotMinute === 60) {
      slotHour += 1;
      slotMinute = 0;
    }
    
    while (slotHour < 21 && slots.length < 8) {
      let endMinute = slotMinute + 15;
      let endHour = slotHour;
      
      if (endMinute >= 60) {
        endHour += 1;
        endMinute = endMinute - 60;
      }
      
      if (endHour > 21 || (endHour === 21 && endMinute > 0)) {
        break;
      }
      
      slots.push({
        value: `today-${slotHour}-${slotMinute}`,
        label: `Сегодня ${slotHour}:${slotMinute.toString().padStart(2, '0')}-${endHour}:${endMinute.toString().padStart(2, '0')}`
      });
      
      slotMinute += 15;
      if (slotMinute >= 60) {
        slotHour += 1;
        slotMinute = 0;
      }
    }

    if (slots.length < 8) {
      for (let hour = 6; hour <= 11; hour++) {
        if (slots.length >= 8) break;
        slots.push({
          value: `tomorrow-${hour}`,
          label: `Завтра ${hour}:00-${hour + 1}:00`
        });
      }
    }

    setTimeSlots(slots);
    setCallTime('asap');
  }, []);

  useEffect(() => {
    if (isTimeDropdownOpen && timeDropdownRef.current) {
      const rect = timeDropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setShouldOpenUp(spaceBelow < 350);
    }
  }, [isTimeDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node)) {
        setIsTimeDropdownOpen(false);
      }
    };

    if (isTimeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTimeDropdownOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitted(true);

    try {
      const selectedSlot = timeSlots.find(slot => slot.value === callTime);
      const callTimeText = selectedSlot?.label || callTime;

      const result = await submitLead({
        type: step === 'connection' ? 'Новое подключение' : 'Поддержка существующего абонента',
        name: name,
        phone: phone,
        houseType: houseType,
        supportValue: supportValue || undefined,
        callTime: callTimeText,
      });

      if (result.success) {
        setTimeout(() => {
          setSubmitted(false);
          setPhone(""); 
          setName("");
          router.push('/complete');
        }, 2000);
      } else {
        console.error('Failed to submit lead:', result.error);
        // В случае ошибки все равно показываем успех пользователю
        setTimeout(() => {
          setSubmitted(false);
          setPhone(""); 
          setName("");
          router.push('/complete');
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      // В случае ошибки все равно показываем успех пользователю
      setTimeout(() => {
        setSubmitted(false);
        setPhone(""); 
        setName("");
        router.push('/complete');
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // step === 'support'
  React.useEffect(() => {
    if (step === 'support' && supportValue) {
      setSupportOnly(true);
    }
  }, [step, supportValue, setSupportOnly]);

  if (!step) {
    return (
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button className="bg-mts-red hover:bg-mts-red-dark text-white font-bold rounded-full px-10 py-4 text-lg transition" onClick={() => setStep('connection')}>Новое подключение</button>
        <button className="bg-transparent border-2 border-white text-white font-bold rounded-full px-10 py-4 text-lg transition hover:bg-white hover:text-[#7500ff]" onClick={() => setStep('support')}>Я существующий абонент</button>
      </div>
    );
  }

  if (step === 'connection') {
    return (
      <>
        <form className="w-full flex flex-col gap-4" autoComplete="off" onSubmit={handleSubmit}>
          {/* Радиокнопки */}
          <div className="flex flex-row gap-8 items-center mb-2 overflow-x-auto pb-2">
            {houseTypes.map((type) => (
              <label key={type} className="flex items-center cursor-pointer select-none text-[16px] font-medium font-sans flex-shrink-0">
                <span className={`w-7 h-7 flex items-center justify-center rounded-full border-2 mr-2 transition-all duration-150 ${houseType === type ? "border-mts-red bg-mts-red" : "border-gray-300 bg-white"}`}>
                  {houseType === type && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" fill="#fff" /></svg>
                  )}
                </span>
                <input type="radio" name="houseType" value={type} checked={houseType === type} onChange={() => setHouseType(type)} className="hidden" />
                <span className={`text-[16px] font-medium font-sans ${houseType === type ? "text-white" : "text-white/80"}`}>{type}</span>
              </label>
            ))}
          </div>
          {/* Поля и кнопка в один ряд */}
          <div className="flex flex-col md:flex-row gap-4 items-end w-full">
            {/* Телефон */}
            <div className="w-full md:flex-1">
              <label className="text-[14px] font-medium font-sans mb-1 text-white text-left">Введите телефон</label>
              <div className="flex flex-row items-center bg-white rounded-full overflow-hidden h-[44px]">
                <span className="bg-gray-100 text-gray-500 px-3 h-full flex items-center font-semibold text-base rounded-l-full select-none">+7</span>
                <InputMask
                  mask="(999) 999-99-99"
                  value={phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                  className="flex-1 bg-transparent border-none px-2 py-2 text-base text-[#222] placeholder-[#bbb] outline-none focus:ring-2 focus:ring-orange-500 transition font-sans"
                  placeholder="(___) ___-__-__"
                  type="tel"
                  autoComplete="tel"
                />
              </div>
            </div>
            {/* Имя */}
            <div className="w-full md:flex-1">
              <label className="text-[14px] font-medium font-sans mb-1 text-white text-left">Введите имя</label>
              <input
                type="text"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                className="w-full rounded-full bg-white px-4 py-2 text-base text-[#222] placeholder-[#bbb] outline-none focus:ring-2 focus:ring-orange-500 transition h-[44px] font-sans"
                placeholder="Имя"
                autoComplete="name"
              />
            </div>
            {/* Кнопка */}
            <button
              type="submit"
              className={`w-full md:w-[200px] h-[44px] rounded-full px-6 text-[16px] font-medium font-sans transition ml-0 md:ml-4 ${isFormValid && !submitted && !isSubmitting ? "bg-mts-red text-white" : "bg-[#FFD6C2] text-white cursor-not-allowed"}`}
              disabled={!isFormValid || submitted || isSubmitting}
            >
              {submitted ? 'Отправлено!' : isSubmitting ? 'Отправляем...' : 'Жду звонка'}
            </button>
          </div>
          {/* Выбор времени */}
          <div className="relative mt-3" ref={timeDropdownRef}>
            <button
              type="button"
              onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
              className={`
                flex items-center gap-2 justify-start text-left transition-all
                text-white text-[13px] font-normal font-sans
                ${isTimeDropdownOpen ? 'opacity-100' : 'opacity-80'}
              `}
            >
              <span>
                {timeSlots.find(slot => slot.value === callTime)?.label || 'Перезвоним в течение 15 минут'}
              </span>
              <svg className={`w-[18px] h-[18px] transition-transform ${isTimeDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24">
                <path d="M7 10l5 5 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {isTimeDropdownOpen && (
              <div className={`
                absolute left-0 right-auto mt-1 bg-white border border-gray-200 rounded-xl shadow-lg
                z-10 max-h-60 overflow-y-auto
                ${shouldOpenUp ? 'bottom-full mb-1' : 'top-full'}
              `}>
                {timeSlots.map((slot) => (
                  <button
                    key={slot.value}
                    type="button"
                    onClick={() => {
                      setCallTime(slot.value);
                      setIsTimeDropdownOpen(false);
                    }}
                    className={`
                      w-full px-4 py-3 text-left transition-colors
                      ${callTime === slot.value
                        ? 'bg-[#ee3c6b] text-white'
                        : 'text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Юридическая строка */}
          <p className="text-[12px] font-light font-sans mt-2 text-left text-[#D8B5FF]">Отправляя заявку, вы соглашаетесь с <a href="#" className="underline">политикой обработки персональных данных</a></p>
        </form>
      </>
    );
  }



  // step === 'support'
  return (
    <div className="flex flex-col gap-4 items-center animate-fade-in">
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 w-full">
        {supportOptions.map((opt) => (
          <button key={opt} className={`px-7 py-3 rounded-full border-2 font-semibold text-base transition focus:outline-none flex-shrink-0 ${supportValue === opt ? "bg-mts-red border-mts-red text-white" : "border-white text-white bg-transparent"}`} onClick={() => setSupportValue(opt)}>{opt}</button>
        ))}
      </div>
      {supportValue && (
        <div className="bg-white/10 rounded-xl p-6 max-w-lg text-center">
          <h3 className="text-xl font-bold mb-2 text-white">Вы являетесь действующим абонентом МТС</h3>
          <p className="mb-2 text-white/80">Мы не сможем ответить на вопросы по действующему подключению или сменить ваш текущий тариф.</p>
          <div className="mb-2">
            <span className="text-base text-white/80">Рекомендуем позвонить по номеру</span><br />
            <a href="tel:88002500890" className="text-2xl md:text-3xl font-bold text-white hover:underline"> 8 800 250-08-90</a>
            <div className="text-xs text-white/60">Звонок бесплатный по РФ</div>
          </div>
          <div className="text-base text-white/80">
            или узнать информацию в <a href="#" className="underline text-white">личном кабинете</a>
          </div>
        </div>
      )}
    </div>
  );
}

function getCityFromCookie() {
  if (typeof document === "undefined") return "в России";
  const match = document.cookie.match(/(?:^|; )user-city=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : "в России";
}

export default function HomePage() {
  const [visibleCount, setVisibleCount] = useState(6);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [isCallRequestModalOpen, setIsCallRequestModalOpen] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState(null);
  const [isSegmentationModalOpen, setIsSegmentationModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState("popular");
  const [activeCategory, setActiveCategory] = useState("all");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  const { isSupportOnly } = useSupportOnly();
  const [city, setCity] = useState("в России");
  const [citySlug, setCitySlug] = useState('');
  const router = useRouter();

  useEffect(() => {
    setCity(getCityFromCookie());
  }, []);

  useEffect(() => {
    const slug = city
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
    setCitySlug(slug);
  }, [city]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const geo = await geoRes.json();
          const cityName = geo.address?.city || geo.address?.town || geo.address?.village;

          console.log("Определен город по координатам:", cityName);

          if (cityName) {
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

            console.log("Слаг города:", slug);

            // получить список файлов из API
            const res = await fetch("/api/available-cities");
            const available = await res.json();

            if (available.includes(slug)) {
              console.log(`Редирект на /${slug}`);
              router.push(`/${slug}`);
            } else {
              console.log(`Город ${slug} не найден среди обслуживаемых`);
            }
          } else {
            console.log("Город по координатам не определен");
          }
        } catch (err) {
          console.log("Ошибка при определении гео:", err);
        }
      },
      (error) => {
        console.log("Ошибка геолокации", error);
      }
    );
  }, [router]);

  // Мемоизированная фильтрация и сортировка тарифов
  const filteredTariffs = React.useMemo(() => {
    let filtered = tariffsData;
    const isDefaultPrice = filters.priceRange[0] === 300 && filters.priceRange[1] === 1650;
    const isDefaultSpeed = filters.speedRange[0] === 50 && filters.speedRange[1] === 1000;
    const hasActiveFilters = filters.internet || filters.tv || filters.mobile || filters.onlineCinema || filters.gameBonuses;

    if (
      activeCategory !== "all" ||
      hasActiveFilters ||
      !isDefaultPrice ||
      !isDefaultSpeed ||
      filters.promotions ||
      filters.hitsOnly
    ) {
      filtered = tariffsData.filter(tariff => {
        // Фильтр по категориям (быстрый фильтр)
        let categoryMatch = true;
        if (activeCategory !== "all") {
          categoryMatch = isTariffInCategory(tariff, activeCategory);
        }

        // Фильтр по боковым фильтрам (только для категории "Все")
        let sidebarMatch = true;
        if (activeCategory === "all" && hasActiveFilters) {
          sidebarMatch = 
            (filters.internet && tariff.type.includes("Интернет")) ||
            (filters.tv && tariff.type.includes("ТВ")) ||
            (filters.mobile && tariff.type.includes("Моб. связь")) ||
            (filters.onlineCinema && tariff.features.some(f => f.includes("KION"))) ||
            (filters.gameBonuses && tariff.features.some(f => f.includes("Игровой") || f.includes("Бонусы в играх")));
        }
        
        // Фильтр по акциям
        const promoMatch = !filters.promotions || 
          tariff.discountPrice !== undefined || 
          tariff.name.toLowerCase().includes('тест-драйв');
        
        // Фильтр по хитам
        const hitsMatch = !filters.hitsOnly || tariff.isHit;
        
        // Фильтр по цене (ВСЕГДА используем базовую цену)
        const basePrice = tariff.price;
        const priceMatch = basePrice >= filters.priceRange[0] && basePrice <= filters.priceRange[1];
        
        // Фильтр по скорости
        const speedMatch = tariff.speed >= filters.speedRange[0] && tariff.speed <= filters.speedRange[1];
        
        return categoryMatch && sidebarMatch && promoMatch && hitsMatch && priceMatch && speedMatch;
      });
    }

    // Сортировка
    switch (sortBy) {
      case "speed":
        filtered = [...filtered].sort((a, b) => b.speed - a.speed);
        break;
      case "price-low":
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      default: // popular
        filtered = [...filtered].sort((a, b) => {
          if (a.isHit && !b.isHit) return -1;
          if (!a.isHit && b.isHit) return 1;
          if (a.isHit === b.isHit) return b.speed - a.speed;
          return 0;
        });
    }
    return filtered;
  }, [filters, activeCategory, sortBy]);

  // Категории для быстрого фильтра
  const categories = [
    { id: "all", label: "Все", count: tariffsData.length },
    { id: "internet", label: "Интернет", count: tariffsData.filter(t => t.type === "Интернет").length },
    { id: "internet-tv", label: "Интернет + ТВ", count: tariffsData.filter(t => t.type === "Интернет + ТВ").length },
    { id: "internet-mobile", label: "Интернет + Моб. связь", count: tariffsData.filter(t => t.type === "Интернет + Моб. связь").length },
    { id: "internet-tv-mobile", label: "Интернет + ТВ + Моб. связь", count: tariffsData.filter(t => {
      const hasInternet = t.speed > 0;
      const hasTV = (t.tvChannels || 0) > 0;
      const hasMobile = (t.mobileData || 0) > 0 || (t.mobileMinutes || 0) > 0;
      
      // Основной критерий - наличие всех трех услуг
      if (hasInternet && hasTV && hasMobile) return true;
      
      // Резервный критерий - только для тарифов с типом "Интернет + ТВ + Моб. связь"
      if (t.type === "Интернет + ТВ + Моб. связь") {
        const categoryKeywords = ['выгоды', 'семейный', 'игровой', 'комбинированный', 'тест-драйв'];
        if (categoryKeywords.some(keyword => t.name.toLowerCase().includes(keyword))) {
          return true;
        }
      }
      
      return false;
    }).length }
  ];

  const mapFiltersToCategory = (f: any) => {
    if (f.internet && f.tv && f.mobile) return "internet-tv-mobile";
    if (f.internet && f.tv && !f.mobile) return "internet-tv";
    if (f.internet && !f.tv && f.mobile) return "internet-mobile";
    if (f.internet && !f.tv && !f.mobile) return "internet";
    return "all";
  };

  const handleTariffClick = (tariff: any) => {
    setSelectedTariff(tariff);
    setIsSegmentationModalOpen(true);
  };

  const handleFilterChange = (newFilters: Partial<typeof defaultFilters>) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      const cat = mapFiltersToCategory(updated);
      setActiveCategory(cat);
      return updated;
    });
  };

  const resetFilters = useCallback(() => {
    setActiveCategory("all");
    setFilters(defaultFilters);
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    
    if (categoryId === "all") {
      // При выборе "Все" сбрасываем боковые фильтры
      setFilters(prev => ({
        ...prev,
        internet: false,
        tv: false,
        mobile: false,
        onlineCinema: false,
        gameBonuses: false
      }));
    } else {
      // Для других категорий применяем соответствующие фильтры
      const serviceFilters = getServiceFiltersForCategory(categoryId);
      
      setFilters(prev => ({
        ...prev,
        ...serviceFilters,
      }));
    }
  };

  const handleMobileFiltersApply = () => {
    setIsMobileFiltersOpen(false);
    // Фильтры уже применены через handleFilterChange
  };

  // Функция прокрутки к блоку тарифов
  const scrollToTariffs = () => {
    const tariffsSection = document.getElementById('tariffs-section');
    if (tariffsSection) {
      tariffsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Обработчик клика по категории в футере
  const handleFooterCategoryClick = (categoryId: string) => {
    handleCategoryChange(categoryId);
    // Небольшая задержка для применения фильтров перед прокруткой
    setTimeout(() => {
      scrollToTariffs();
    }, 100);
  };

  const isAllCategoryActive = !filters.internet && !filters.tv && !filters.mobile;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <HeroAddressSearch />

      <main className="container mx-auto px-4 py-8 flex-grow flex flex-col lg:flex-row gap-8">

        {/* Desktop Filters Sidebar */}
        <aside className="hidden lg:block w-1/4">
          <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-4">
            <h3 className="text-xl font-bold mb-6 text-gray-900">Фильтры</h3>

            {[
              { key: 'internet', label: 'Интернет' },
              { key: 'tv', label: 'ТВ' },
              { key: 'mobile', label: 'Мобильная связь' },
              { key: 'onlineCinema', label: 'Онлайн-кинотеатр' },
              { key: 'gameBonuses', label: 'Игровые бонусы' },
            ].map(item => (
              <label key={item.key} className="flex items-center space-x-3 mb-4 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={filters[item.key as keyof typeof filters] as boolean}
                    onChange={() => handleFilterChange({ [item.key]: !filters[item.key as keyof typeof filters] })}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    filters[item.key as keyof typeof filters] as boolean 
                      ? 'bg-[#ee3c6b] border-[#ee3c6b]' 
                      : 'border-gray-300 group-hover:border-[#ee3c6b]'
                  }`}>
                    {filters[item.key as keyof typeof filters] as boolean && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-gray-700 group-hover:text-[#ee3c6b] transition-colors">{item.label}</span>
              </label>
            ))}

            <div className="my-6 border-t border-gray-200 pt-6">
              <h4 className="font-semibold mb-4 text-gray-900">Спецпредложения</h4>
              {[
                { key: 'promotions', label: '% Акции' },
                { key: 'hitsOnly', label: 'Только хиты' },
              ].map(item => (
                <label key={item.key} className="flex items-center space-x-3 mb-4 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={filters[item.key as keyof typeof filters] as boolean}
                      onChange={() => handleFilterChange({ [item.key]: !filters[item.key as keyof typeof filters] })}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      filters[item.key as keyof typeof filters] as boolean 
                        ? 'bg-[#ee3c6b] border-[#ee3c6b]' 
                        : 'border-gray-300 group-hover:border-[#ee3c6b]'
                    }`}>
                      {filters[item.key as keyof typeof filters] as boolean && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-700 group-hover:text-[#ee3c6b] transition-colors">{item.label}</span>
                </label>
              ))}
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-4 text-gray-900">Стоимость в месяц (₽)</h4>
              <div className="flex justify-between text-sm text-gray-600 mb-3">
                <span>{filters.priceRange[0]}</span>
                <span>{filters.priceRange[1]}</span>
              </div>
              <Slider
                range
                min={300}
                max={1650}
                value={filters.priceRange}
                onChange={(value) => Array.isArray(value) && handleFilterChange({ priceRange: value })}
                trackStyle={[{ backgroundColor: '#ee3c6b' }]}
                handleStyle={[
                  { borderColor: '#ee3c6b', backgroundColor: '#ee3c6b', boxShadow: '0 2px 6px rgba(238, 60, 107, 0.3)' },
                  { borderColor: '#ee3c6b', backgroundColor: '#ee3c6b', boxShadow: '0 2px 6px rgba(238, 60, 107, 0.3)' }
                ]}
                railStyle={{ backgroundColor: '#e5e5ed' }}
              />
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-4 text-gray-900">Скорость (Мбит/с)</h4>
              <div className="flex justify-between text-sm text-gray-600 mb-3">
                <span>{filters.speedRange[0]}</span>
                <span>{filters.speedRange[1]}</span>
              </div>
              <Slider
                range
                min={50}
                max={1000}
                value={filters.speedRange}
                onChange={(value) => Array.isArray(value) && handleFilterChange({ speedRange: value })}
                trackStyle={[{ backgroundColor: '#ee3c6b' }]}
                handleStyle={[
                  { borderColor: '#ee3c6b', backgroundColor: '#ee3c6b', boxShadow: '0 2px 6px rgba(238, 60, 107, 0.3)' },
                  { borderColor: '#ee3c6b', backgroundColor: '#ee3c6b', boxShadow: '0 2px 6px rgba(238, 60, 107, 0.3)' }
                ]}
                railStyle={{ backgroundColor: '#e5e5ed' }}
              />
            </div>

            <button
              onClick={resetFilters}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition"
            >
              Сбросить фильтры
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div id="tariffs-section" className="w-full lg:w-3/4">
          {/* Category Filters */}
          <div className="mb-8">
            <div className="flex gap-3 items-center overflow-x-auto scroll-smooth whitespace-nowrap pb-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                    activeCategory === category.id
                      ? "bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Header with Sort */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Доступные тарифы 
              <span className="text-lg font-normal text-gray-600 ml-2">
                ({filteredTariffs.length})
              </span>
            </h2>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Сортировка:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm min-w-[140px] focus:ring-2 focus:ring-[#ee3c6b] focus:border-transparent"
              >
                <option value="popular">Популярные</option>
                <option value="speed">Быстрые</option>
                <option value="price-low">Подешевле</option>
                <option value="price-high">Подороже</option>
              </select>
              
               <button
               onClick={() => setIsMobileFiltersOpen(true)}
               className="lg:hidden inline-flex items-center gap-1 px-2 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-medium text-[#ee3c6b] hover:bg-gray-50 transition-colors"
             >
               <FiFilter size={12} />
               <span className="sm:inline hidden">Все фильтры</span>
               <span className="sm:hidden">Фильтры</span>
             </button>
            </div>
          </div>

          {/* Tariffs Grid */}
          {filteredTariffs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTariffs.slice(0, visibleCount).map((tariff) => (
                  <TariffCard
                    key={tariff.id}
                    tariff={tariff}
                    onClick={() => handleTariffClick(tariff)}
                  />
                ))}
              </div>
              {visibleCount < filteredTariffs.length && (
                <div className="text-center mt-8">
                  <button 
                    onClick={() => setVisibleCount(prev => Math.min(prev + 6, filteredTariffs.length))}
                    className="bg-white border-2 border-[#ee3c6b] text-[#ee3c6b] px-8 py-3 rounded-xl font-medium hover:bg-[#ee3c6b] hover:text-white transition-all"
                  >
                    Показать ещё
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
              <div className="text-gray-600 mb-4">Тарифы не найдены</div>
              <button 
                onClick={resetFilters}
                className="bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Сбросить фильтры
              </button>
            </div>
          )}

          {/* Help Section */}
          <section className="mt-16 rounded-2xl bg-gradient-to-r from-[#8e66e4] to-[#c1d8fb] p-8 md:p-12 text-white">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Хотите быстро найти самый выгодный тариф?</h2>
              <p className="text-lg md:text-xl mb-8 opacity-90">Подберите тариф с экспертом. Найдём для вас лучшее решение с учетом ваших пожеланий</p>
              
              <SupportOnlyBlock>
                <TariffHelpForm />
              </SupportOnlyBlock>
            </div>
          </section>
        </div>
      </main>
      <HowConnect onOpenSegmentationModal={() => setIsSegmentationModalOpen(true)} />
      <Bonuses onOpenSegmentationModal={() => setIsSegmentationModalOpen(true)} />
      <PromoSlider onOpenSegmentationModal={() => setIsSegmentationModalOpen(true)} />
      <EquipmentBlock />
      
      <InfoBlockKrasnodar />
      <FaqBlock />
      <SupportOnlyBlock isQuestionsBlock={true}>
        <QuestionsBlock />
      </SupportOnlyBlock>
      <Footer cityName={citySlug}/>
      
      
      {/* Модальные окна */}
      <SegmentationModal
        isOpen={isSegmentationModalOpen}
        onClose={() => setIsSegmentationModalOpen(false)}
        onNewConnection={() => setIsConnectionModalOpen(true)}
        onExistingConnection={() => setIsCallRequestModalOpen(true)} // Добавлен промпт для существующего абонента - открывает CallRequestModal
      />
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />
      <ConnectionForm
        isOpen={isConnectionModalOpen}
        onClose={() => setIsConnectionModalOpen(false)}
      />
      <CallRequestModal
        isOpen={isCallRequestModalOpen}
        onClose={() => setIsCallRequestModalOpen(false)}
      />
      <MobileFiltersDrawer
        open={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        filters={filters}
        onFiltersChange={handleFilterChange}
        onApply={handleMobileFiltersApply}
        onClear={resetFilters}
      />
    </div>
  );
}
