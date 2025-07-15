import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {/* Cactus SVG Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            {/* Número 404 con cactus en el centro */}
            <div className="flex items-center justify-center">
              <span className="text-8xl font-bold text-gray-800 mr-4">4</span>
              
              {/* Cactus SVG */}
              <svg 
                width="120" 
                height="120" 
                viewBox="0 0 120 120" 
                className="mx-4"
              >
                {/* Cactus principal */}
                <rect x="45" y="30" width="30" height="70" rx="15" fill="#4ADE80" stroke="#16A34A" strokeWidth="2"/>
                
                {/* Brazo izquierdo */}
                <rect x="20" y="45" width="20" height="35" rx="10" fill="#4ADE80" stroke="#16A34A" strokeWidth="2"/>
                <rect x="30" y="40" width="15" height="15" rx="7" fill="#4ADE80" stroke="#16A34A" strokeWidth="2"/>
                
                {/* Brazo derecho */}
                <rect x="80" y="50" width="20" height="30" rx="10" fill="#4ADE80" stroke="#16A34A" strokeWidth="2"/>
                <rect x="75" y="45" width="15" height="15" rx="7" fill="#4ADE80" stroke="#16A34A" strokeWidth="2"/>
                
                {/* Espinas en el cactus principal */}
                <g stroke="#16A34A" strokeWidth="1" fill="none">
                  <line x1="48" y1="35" x2="46" y2="32" />
                  <line x1="52" y1="35" x2="50" y2="32" />
                  <line x1="68" y1="35" x2="70" y2="32" />
                  <line x1="72" y1="35" x2="74" y2="32" />
                  
                  <line x1="48" y1="50" x2="46" y2="47" />
                  <line x1="52" y1="50" x2="50" y2="47" />
                  <line x1="68" y1="50" x2="70" y2="47" />
                  <line x1="72" y1="50" x2="74" y2="47" />
                  
                  <line x1="48" y1="65" x2="46" y2="62" />
                  <line x1="52" y1="65" x2="50" y2="62" />
                  <line x1="68" y1="65" x2="70" y2="62" />
                  <line x1="72" y1="65" x2="74" y2="62" />
                  
                  <line x1="48" y1="80" x2="46" y2="77" />
                  <line x1="52" y1="80" x2="50" y2="77" />
                  <line x1="68" y1="80" x2="70" y2="77" />
                  <line x1="72" y1="80" x2="74" y2="77" />
                </g>
                
                {/* Espinas en brazos */}
                <g stroke="#16A34A" strokeWidth="1" fill="none">
                  <line x1="23" y1="50" x2="21" y2="47" />
                  <line x1="27" y1="50" x2="25" y2="47" />
                  <line x1="23" y1="65" x2="21" y2="62" />
                  <line x1="27" y1="65" x2="25" y2="62" />
                  
                  <line x1="83" y1="55" x2="85" y2="52" />
                  <line x1="87" y1="55" x2="89" y2="52" />
                  <line x1="83" y1="70" x2="85" y2="67" />
                  <line x1="87" y1="70" x2="89" y2="67" />
                </g>
                
                {/* Base/tierra */}
                <ellipse cx="60" cy="105" rx="35" ry="8" fill="#A3A3A3" opacity="0.3"/>
              </svg>
              
              <span className="text-8xl font-bold text-gray-800 ml-4">4</span>
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          ¡Algo salió mal!
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          La página que estás buscando no existe
        </p>
        <Link
          to="/"
          className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl"
        >
          Regresar
        </Link>
      </div>
    </div>
  );
}