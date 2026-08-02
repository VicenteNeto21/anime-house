import { AniListAPI } from '@/lib/api';
import CalendarClient from './CalendarClient';

export default async function CalendarSection() {
  try {
    const schedules = await AniListAPI.getAiringSchedule();
    return <CalendarClient schedules={schedules} />;
  } catch (error) {
    console.error('Erro ao buscar calendário no servidor:', error);
    return null;
  }
}
