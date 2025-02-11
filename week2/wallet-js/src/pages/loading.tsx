import React from "react";

const LoadingScreen = () => {
  return (
    <div className="w-screen h-screen bg-cyberpunk-loading bg-cover bg-center flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-neonPink border-opacity-70"></div>
        <h1 className="mt-8 text-3xl font-bold text-neonPink drop-shadow-lg animate-pulse">
          Loading...
        </h1>
      </div>
    </div>
  );
};

export default LoadingScreen;
