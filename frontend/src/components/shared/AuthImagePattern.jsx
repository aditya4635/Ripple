import RainbowHover from "./RainbowHover";

const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-6">
      <div className="max-w-md text-center">
      <h2 className="text-2xl font-bold mb-4 mt-12"><RainbowHover>{title}</RainbowHover></h2>
      <p className="text-base-content/60"><RainbowHover>{subtitle}</RainbowHover></p>
      
        <div className="grid grid-cols-3 gap-3 mb-4 mt-10">
        
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-2xl bg-primary/10 flex items-center justify-center group relative overflow-hidden
              hover:scale-105 transition-transform duration-500 ${
                i % 2 === 0 ? "animate-pulse hover:animate-none" : ""
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <span className="relative z-10 text-primary group-hover:text-white font-bold tracking-wider transition-colors duration-500 drop-shadow-md">
                Ripples
              </span>
            </div>
          ))}
          
        </div>
        
       
      </div>
    </div>
  );
};

export default AuthImagePattern;
