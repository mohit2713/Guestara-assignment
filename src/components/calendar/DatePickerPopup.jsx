import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const DatePickerPopup = ({ selectedDate, onDateSelect, onClose }) => {
  const [currentViewDate, setCurrentViewDate] = React.useState(selectedDate);
  
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const currentMonth = startOfMonth(currentViewDate);
  const daysInMonth = eachDayOfInterval({
    start: currentMonth,
    end: endOfMonth(currentMonth)
  });

  // Get days from previous month to fill the first week
  const firstDayOfMonth = currentMonth.getDay();
  const prevMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => {
    const date = new Date(currentMonth);
    date.setDate(-i);
    return date;
  }).reverse();

  // Get days for next month to fill the last week
  const lastDayOfMonth = daysInMonth[daysInMonth.length - 1].getDay();
  const nextMonthDays = Array.from({ length: 6 - lastDayOfMonth }, (_, i) => {
    const date = new Date(daysInMonth[daysInMonth.length - 1]);
    date.setDate(date.getDate() + i + 1);
    return date;
  });

  const allDays = [...prevMonthDays, ...daysInMonth, ...nextMonthDays];

  const handlePrevMonth = () => {
    setCurrentViewDate(prevDate => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentViewDate(prevDate => addMonths(prevDate, 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-start">
      {/* Semi-transparent overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-20" onClick={onClose} />
      
      {/* Calendar popup */}
      <div className="absolute left-4 top-16 bg-white rounded-lg shadow-xl border p-4 min-w-[280px] z-50">
        {/* Month and Year with Navigation */}
        <div className="flex justify-around text-center mb-4">
          <div className="text-2xl font-normal text-blue-500">
            {format(currentViewDate, 'MMMM')}
          </div>
          <div className="flex justify-center items-center gap-4">
            <div className="text-2xl font-normal text-blue-500">
              {format(currentViewDate, 'yyyy')}
            </div>
            <div className="flex gap-2">
              <button 
                className="text-blue-500 p-1 hover:bg-gray-100 rounded"
                onClick={handlePrevMonth}
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button 
                className="text-blue-500 p-1 hover:bg-gray-100 rounded"
                onClick={handleNextMonth}
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {days.map(day => (
            <div key={day} className="text-center text-sm font-medium p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {allDays.map((date, index) => (
            <button
              key={index}
              onClick={() => onDateSelect(date)}
              className={`
                p-2 text-center text-sm relative hover:bg-gray-50
                ${!isSameMonth(date, currentViewDate) ? 'text-gray-400' : ''}
                ${isToday(date) ? 'text-white' : ''}
                ${
                  isToday(date)
                    ? 'before:absolute before:inset-1 before:bg-blue-500 before:rounded-full before:z-0'
                    : ''
                }
              `}
            >
              <span className={`relative z-10 ${isToday(date) ? 'text-white' : ''}`}>
                {format(date, 'd')}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DatePickerPopup; 