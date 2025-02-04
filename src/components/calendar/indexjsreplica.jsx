// import React, { useState, useRef, useEffect } from 'react';
// import TimelineGrid from '../calendar/TimelineGrid';
// import DatePickerPopup from './DatePickerPopup';
// import { format, addMonths, subMonths } from 'date-fns';
// import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

// const Calendar = () => {
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const datePickerRef = useRef(null);
  
//   const resources = Array.from({ length: 15 }, (_, index) => ({
//     id: String.fromCharCode(65 + index),
//     name: `Resource ${String.fromCharCode(65 + index)}`
//   }));

//   // Close date picker when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
//         setShowDatePicker(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const handlePreviousMonth = () => {
//     setCurrentDate(prevDate => subMonths(prevDate, 1));
//   };

//   const handleNextMonth = () => {
//     setCurrentDate(prevDate => addMonths(prevDate, 1));
//   };

//   const handleToday = () => {
//     setCurrentDate(new Date());
//   };

//   const handleDateSelect = (date) => {
//     setCurrentDate(date);
//     setShowDatePicker(false);
//   };

//   return (
//     <div className="flex flex-col h-screen bg-white">
//       {/* Header */}
//       <div className="flex justify-between items-center px-4 py-2 border-b">
//         <div className="relative" ref={datePickerRef}>
//           <button
//             onClick={() => setShowDatePicker(!showDatePicker)}
//             className="text-2xl text-blue-500 font-normal hover:text-blue-300"
//           >
//             {format(currentDate, 'MMMM yyyy')}
//           </button>
          
//           {showDatePicker && (
//             <DatePickerPopup
//               selectedDate={currentDate}
//               onDateSelect={handleDateSelect}
//               onClose={() => setShowDatePicker(false)}
//             />
//           )}
//         </div>
//         <div className="flex items-center">
//           <button 
//             onClick={handlePreviousMonth}
//             className="p-1 hover:bg-gray-100 rounded"
//           >
//             <ChevronLeftIcon className="w-5 h-5 text-blue-500" />
//           </button>
//           <button 
//             onClick={handleToday}
//             className="text-blue-500 hover:text-blue-300 px-4 "
//           >
//             Today
//           </button>
//           <button 
//             onClick={handleNextMonth}
//             className="p-1 hover:bg-gray-100 rounded"
//           >
//             <ChevronRightIcon className="w-5 h-5 text-blue-500" />
//           </button>
//         </div>
//       </div>

//       {/* Timeline Grid */}
//       <div className="flex-1 overflow-auto">
//         <TimelineGrid 
//           currentDate={currentDate} 
//           resources={resources}
//           events={[]}
//           onAddEvent={(resourceId, date) => {
//             console.log('Add event:', resourceId, date);
//           }}
//         />
//       </div>
//     </div>
//   );
// };

// export default Calendar;