import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-green-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-6 drop-shadow-md">🚲 Welcome to Bike Pooling</h1>
      
      <p className="text-lg text-gray-600 mb-8">Find or offer a ride easily and safely.</p>

      <div className="flex space-x-6">
        <button 
          onClick={() => navigate("/find-ride")} 
          className="px-8 py-3 text-lg font-semibold text-white bg-blue-500 rounded-lg shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-105"
        >
          🚘 Find a Ride
        </button>
        
        <button 
          onClick={() => navigate("/create-ride")} 
          className="px-8 py-3 text-lg font-semibold text-white bg-green-500 rounded-lg shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105"
        >
          🏍️ Create a Ride
        </button>
      </div>
    </div>
  );
};

export default Home;
