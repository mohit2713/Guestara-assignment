const ResourceList = ({ resources }) => {
  return (
    <div className="w-48 border-r bg-white">
      <div className="h-14 border-b flex items-center justify-center font-semibold text-gray-700">
        Resources
      </div>
      <div className="overflow-y-auto">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="h-[100px] border-b px-4 flex items-center text-gray-700"
          >
            {resource.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceList;
