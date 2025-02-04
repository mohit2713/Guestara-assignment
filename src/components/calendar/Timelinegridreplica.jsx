// import React from 'react';
// import { startOfMonth, endOfMonth, eachDayOfInterval, format, isToday } from 'date-fns';

// const TimelineGrid = ({ currentDate, resources, events, onAddEvent }) => {
//   const daysInMonth = eachDayOfInterval({
//     start: startOfMonth(currentDate),
//     end: endOfMonth(currentDate),
//   });

//   return (
//     <div className="relative">
//       <div className="grid" style={{
//         gridTemplateColumns: `150px repeat(${daysInMonth.length}, minmax(100px, 1fr))`
//       }}>
//         {/* Corner Header Cell */}
//         <div className="sticky top-0 left-0 z-20 bg-white border-b border-r ">
//         </div>

//         {/* Date Headers */}
//         {daysInMonth.map((day) => (
//           <div 
//             key={day.toString()} 
//             className={`sticky top-0 z-10 bg-white border-b border-r  ${
//               isToday(day) ? 'bg-blue-50' : ''
//             }`}
//           >
//             <div className="flex flex-col items-center justify-center h-full">
//               <div className={`text-sm ${isToday(day) ? 'text-blue-500' : ''}`}>
//                 {format(day, 'd')} {format(day, 'EEE')}
//               </div>
//             </div>
//           </div>
//         ))}

//         {/* Resources and Grid */}
//         {resources.map((resource) => (
//           <React.Fragment key={resource.id}>
//             {/* Resource Names - Sticky Left */}

//             <div className="sticky pl-2 pt-1 left-0 z-10 bg-white border-b border-r h-14 flex px-4">
//               <span className="font-medium">{resource.name}</span>
//             </div>

//             {/* Grid Cells */}
//             {daysInMonth.map((day) => (
//               <div
//                 key={`${resource.id}-${day}`}
//                 className="border-b border-r h-14 hover:bg-gray-50"
//                 onClick={() => onAddEvent(resource.id, day)}
//               >
//                 {events
//                   .filter(event => 
//                     event.resourceId === resource.id && 
//                     format(new Date(event.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
//                   )
//                   .map((event) => (
//                     <div
//                       key={event.id}
//                       className="m-1 p-1 text-xs rounded"
//                       style={{ backgroundColor: event.color }}
//                     >
//                       {event.title}
//                     </div>
//                   ))}
//               </div>
//             ))}
//           </React.Fragment>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default TimelineGrid;

