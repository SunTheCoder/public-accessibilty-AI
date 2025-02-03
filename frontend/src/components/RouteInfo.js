const RouteInfo = ({ distance, duration, isAlternative, alternativeIndex, onClose }) => {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg" style={{ zIndex: 1001 }}>
      <div className="flex justify-between items-center space-x-8">
        <div className="space-y-2">
          <div className="text-gray-600">Distance</div>
          <div className="text-xl font-bold">{(distance/1000).toFixed(2)} km</div>
        </div>
        <div className="space-y-2">
          <div className="text-gray-600">Duration</div>
          <div className="text-xl font-bold">{(duration/60).toFixed(0)} min</div>
        </div>
        {isAlternative && (
          <div className="text-purple-600 font-medium">
            Alternative Route {alternativeIndex}
          </div>
        )}
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default RouteInfo; 