import { format, isToday, isSameMonth } from 'date-fns';

export const formatDate = (date) => format(date, 'yyyy-MM-dd');

export const isCurrentMonth = (date, currentDate) => 
  isSameMonth(new Date(date), currentDate);

export const checkIsToday = (date) => isToday(new Date(date));
