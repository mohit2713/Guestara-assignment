import React from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  isSameMonth, 
  isToday,
  addMonths, 
  subMonths,
} from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const DatePickerPopup = ({ selectedDate, onDateSelect, onClose }) => {
  const [currentViewDate, setCurrentViewDate] = React.useState(selectedDate);
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Get only current month days
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentViewDate),
    end: endOfMonth(currentViewDate)
  });

  const handlePrevMonth = () => {
    setCurrentViewDate(prevDate => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentViewDate(prevDate => addMonths(prevDate, 1));
  };

  // Create weeks array for the grid
  const weeks = [];
  let currentWeek = [];
  
  // Add empty cells for days before the first of the month
  const firstDayOfMonth = daysInMonth[0].getDay();
  for (let i = 0; i < firstDayOfMonth; i++) {
    currentWeek.push(null);
  }

  // Add the days of the month
  daysInMonth.forEach((day) => {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  });

  // Add empty cells for days after the last of the month
  while (currentWeek.length < 7) {
    currentWeek.push(null);
  }
  weeks.push(currentWeek);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-start">
      {/* Semi-transparent overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-20" onClick={onClose} />
      
      {/* Calendar popup */}
      <div className="absolute left-4 top-16 bg-white rounded-lg shadow-xl border p-4 min-w-[280px] z-50">
        {/* Month and Year with Navigation */}
        <div className="flex text-center mb-4">
          <div className="text-2xl font-normal text-blue-500">
            {format(currentViewDate, 'MMMM')}
          </div>
          <div className="flex justify-center items-center ">
            <div className="text-2xl font-normal pl-2 text-blue-500">
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
          {weeks.map((week, weekIndex) => 
            week.map((date, dayIndex) => (
              <button
                key={`${weekIndex}-${dayIndex}`}
                onClick={() => date && onDateSelect(date)}
                className={`
                  p-2 text-center text-sm relative hover:bg-gray-50
                  ${!date ? 'text-gray-300 cursor-default' : 'text-gray-700'}
                  ${date && isToday(date) ? 'text-white' : ''}
                  ${
                    date && isToday(date)
                      ? 'before:absolute before:inset-1 before:bg-blue-500 before:rounded-full before:z-0'
                      : ''
                  }
                `}
                disabled={!date}
              >
                <span className={`relative z-10 ${date && isToday(date) ? 'text-white' : ''}`}>
                  {date ? format(date, 'd') : ''}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DatePickerPopup; 