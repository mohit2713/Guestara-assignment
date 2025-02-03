import { Draggable } from 'react-beautiful-dnd';
import { TrashIcon } from '@heroicons/react/24/outline';

const Event = ({ event, index, onDelete }) => {
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this event?')) {
      onDelete(event.id);
    }
  };

  return (
    <Draggable draggableId={event.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-2 mb-2 rounded-md text-sm ${
            snapshot.isDragging ? 'opacity-50' : ''
          }`}
          style={{
            backgroundColor: event.color,
            ...provided.draggableProps.style,
          }}
        >
          <div className="flex justify-between items-center">
            <span className="font-medium text-white truncate">{event.title}</span>
            <button
              onClick={handleDelete}
              className="text-white hover:text-red-200"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default Event;
