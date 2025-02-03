import { format } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const CalendarHeader = ({ currentDate, onPrevMonth, onNextMonth }) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-semibold text-gray-800">
          {format(currentDate, 'MMMM yyyy')}
        </h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={onPrevMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={onNextMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
      <button
        onClick={() => {}} // Add today navigation functionality
        className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md"
      >
        Today
      </button>
    </div>
  );
};

export default CalendarHeader;
