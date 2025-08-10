import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [activeActivity, setActiveActivity] = useState(null);
  const [packages, setPackages] = useState([]);
  const [pastActivities, setPastActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [showConsultForm, setShowConsultForm] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [consultEmail, setConsultEmail] = useState('');
  const [consultResults, setConsultResults] = useState(null);
  
  // Purchase form state
  const [purchaseForm, setPurchaseForm] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchData();
    
    // Auto-slide images
    const interval = setInterval(() => {
      if (activeActivity && activeActivity.images) {
        setCurrentImageIndex((prev) => 
          prev === activeActivity.images.length - 1 ? 0 : prev + 1
        );
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [activeActivity]);

  const fetchData = async () => {
    try {
      const [activityRes, packagesRes, pastRes] = await Promise.all([
        axios.get(`${API_BASE}/api/activities/active`),
        axios.get(`${API_BASE}/api/packages`),
        axios.get(`${API_BASE}/api/past-activities`)
      ]);
      
      setActiveActivity(activityRes.data);
      setPackages(packagesRes.data);
      setPastActivities(pastRes.data.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handlePurchase = async (packageData) => {
    if (!purchaseForm.name || !purchaseForm.email || !purchaseForm.phone) {
      alert('Por favor completa todos los campos');
      return;
    }
    
    try {
      const response = await axios.post(`${API_BASE}/api/purchase`, {
        activity_id: activeActivity._id,
        quantity: packageData.quantity,
        name: purchaseForm.name,
        email: purchaseForm.email,
        phone: purchaseForm.phone
      });
      
      if (response.data.success) {
        alert(`¡Compra exitosa! Tus números: ${response.data.numbers.join(', ')}`);
        setShowPurchaseForm(false);
        setPurchaseForm({ name: '', email: '', phone: '' });
        fetchData(); // Refresh data
      }
    } catch (error) {
      alert('Error en la compra. Intenta de nuevo.');
      console.error('Purchase error:', error);
    }
  };

  const handleConsult = async () => {
    if (!consultEmail) {
      alert('Por favor ingresa tu email');
      return;
    }
    
    try {
      const response = await axios.post(`${API_BASE}/api/query-numbers`, {
        email: consultEmail
      });
      
      setConsultResults(response.data.data);
    } catch (error) {
      alert('Error al consultar números');
      console.error('Consult error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-flores-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-black text-white">
        {/* Top banner */}
        <div className="bg-flores-green text-black text-center py-2 text-sm font-bold">
          ¡VÁLIDO PARA TODO EL ECUADOR!
        </div>
        
        {/* Main header */}
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold">
            PROYECTOS <span className="text-flores-green">FLORES</span>
          </div>
          <div className="text-sm">
            Cumpliendo sueños.
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {activeActivity && (
          <>
            {/* Activity header */}
            <div className="text-center mb-8">
              <div className="text-flores-green text-sm font-bold mb-2">
                NUEVA ACTIVIDAD #{activeActivity.number}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-2">
                JUEGA
              </h1>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-700 mb-4">
                {activeActivity.title}
              </h2>
              <div className="text-lg text-gray-600 mb-6">
                ACTIVIDAD #{activeActivity.number}
              </div>
            </div>

            {/* Image gallery */}
            <div className="mb-8">
              <div className="relative w-full max-w-4xl mx-auto">
                <img
                  src={activeActivity.images[currentImageIndex]}
                  alt={`Actividad ${activeActivity.number}`}
                  className="w-full h-96 object-cover rounded-lg shadow-lg"
                />
                
                {/* Image indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {activeActivity.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full ${
                        index === currentImageIndex ? 'bg-flores-green' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Progress section */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h3 className="text-2xl font-bold text-center mb-4">¡CANTIDADES LIMITADAS!</h3>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span>Números Vendidos: {activeActivity.progress}%</span>
                  <span>{activeActivity.sold_numbers.toLocaleString()} / {activeActivity.total_numbers.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-flores-green h-4 rounded-full transition-all duration-300"
                    style={{ width: `${activeActivity.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <p className="text-gray-600 text-center">
                Los vehículos se jugarán una vez vendida la totalidad de los números, es decir, 
                cuando la barra de progreso llegue al 100%. Se hará tomando los 5 números de la 
                primera y segunda suerte de la suertuda (programa de la lotería nacional).
              </p>
            </div>

            {/* Instant prizes */}
            {activeActivity.instant_prizes && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h3 className="text-2xl font-bold text-center mb-4">¡PREMIOS INSTANTÁNEOS!</h3>
                <p className="text-center mb-4">
                  ¡Hay 10 números bendecidos con premios en efectivo! Realiza tu compra y revisa si tienes uno de los siguientes números:
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {activeActivity.instant_prizes.map((prize, index) => (
                    <div key={index} className={`text-center p-4 rounded-lg ${
                      prize.claimed ? 'bg-gray-200 text-gray-500' : 'bg-flores-green text-white'
                    }`}>
                      <div className={`text-xl font-bold ${prize.claimed ? 'line-through' : ''}`}>
                        {prize.number}
                      </div>
                      {prize.claimed && (
                        <div className="text-sm">¡Premio Entregado!</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* How to participate */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h3 className="text-2xl font-bold text-center mb-4">¿Cómo participar?</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="bg-flores-green text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">1</span>
                  <p>Selecciona el paquete de números que desees, recuerda que mientras más números tengas, más oportunidades tendrás de ganar.</p>
                </div>
                <div className="flex items-start">
                  <span className="bg-flores-green text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">2</span>
                  <p>Serás redirigido a una página donde seleccionarás tu forma de pago y llenarás tus datos.</p>
                </div>
                <div className="flex items-start">
                  <span className="bg-flores-green text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">3</span>
                  <p>Una vez realizado el pago, automáticamente y de manera aleatoria se asignarán tus números, los mismos que serán enviados al correo electrónico registrado con la compra.</p>
                </div>
              </div>
            </div>

            {/* Purchase packages */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h3 className="text-3xl font-bold text-center mb-6">¡ADQUIERE TUS NÚMEROS!</h3>
              <div className="text-center mb-6">
                <span className="text-lg font-bold">Valor de la Unidad: $1</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg, index) => (
                  <div key={index} className={`border-2 rounded-lg p-6 text-center relative ${
                    pkg.popular ? 'border-flores-orange bg-orange-50' : 'border-gray-200'
                  }`}>
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-flores-orange text-white px-4 py-1 rounded-full text-sm font-bold">
                        ★ Más Vendido ★
                      </div>
                    )}
                    
                    <h4 className="text-xl font-bold mb-2">x{pkg.quantity} Números</h4>
                    <div className="text-3xl font-bold text-flores-green mb-4">${pkg.price}</div>
                    <button
                      onClick={() => {
                        setSelectedPackage(pkg);
                        setShowPurchaseForm(true);
                      }}
                      className="w-full bg-flores-orange hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                      COMPRAR
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Consult numbers */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h3 className="text-2xl font-bold text-center mb-4">CONSULTA TUS NÚMEROS</h3>
              <p className="text-center mb-4">¿Ya hiciste tu compra?</p>
              <p className="text-center mb-4">Consulta tus números ingresando aquí tu correo electrónico.</p>
              
              <div className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  value={consultEmail}
                  onChange={(e) => setConsultEmail(e.target.value)}
                  placeholder="tucorreo@email.com"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-flores-green"
                />
                <button
                  onClick={handleConsult}
                  className="bg-flores-green hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  CONSULTAR
                </button>
              </div>
              
              {consultResults && (
                <div className="mt-6">
                  <h4 className="font-bold mb-2">Tus números:</h4>
                  {consultResults.map((result, index) => (
                    <div key={index} className="bg-gray-100 p-4 rounded-lg mb-2">
                      <div className="font-bold">{result.activity_title}</div>
                      <div className="text-sm text-gray-600">Números: {result.numbers.join(', ')}</div>
                      <div className="text-sm text-gray-600">Total pagado: ${result.total_paid}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past activities */}
            {pastActivities.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h3 className="text-2xl font-bold text-center mb-6">ACTIVIDADES ANTERIORES</h3>
                <div className="space-y-6">
                  {pastActivities.map((activity, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <h4 className="font-bold text-lg">{activity.title}</h4>
                      <p className="text-gray-600">Actividad #{activity.number}</p>
                      {activity.winner && (
                        <p className="text-flores-green font-bold">Ganador: {activity.winner}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Purchase Modal */}
      {showPurchaseForm && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Comprar {selectedPackage.quantity} números</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Tu nombre completo"
                value={purchaseForm.name}
                onChange={(e) => setPurchaseForm({...purchaseForm, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-flores-green"
              />
              <input
                type="email"
                placeholder="tucorreo@email.com"
                value={purchaseForm.email}
                onChange={(e) => setPurchaseForm({...purchaseForm, email: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-flores-green"
              />
              <input
                type="tel"
                placeholder="Tu número de teléfono"
                value={purchaseForm.phone}
                onChange={(e) => setPurchaseForm({...purchaseForm, phone: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-flores-green"
              />
            </div>
            
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowPurchaseForm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handlePurchase(selectedPackage)}
                className="flex-1 bg-flores-green hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Pagar ${selectedPackage.price}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-4 right-4 bg-flores-green hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-colors z-40"
      >
        {showChat ? '✕' : '💬'}
      </button>

      {/* Chat modal */}
      {showChat && (
        <div className="fixed bottom-20 right-4 bg-white rounded-lg shadow-xl p-4 w-80 z-50">
          <h4 className="font-bold mb-2">ASISTENTE IA</h4>
          <p className="text-sm text-gray-600 mb-4">
            ¡Hola! Soy el asistente IA de Proyectos Flores, ¿en qué puedo ayudarte?
          </p>
          <div className="space-y-2">
            <button className="w-full text-left bg-gray-100 hover:bg-gray-200 p-2 rounded text-sm">
              ¿Cómo funciona la rifa?
            </button>
            <button className="w-full text-left bg-gray-100 hover:bg-gray-200 p-2 rounded text-sm">
              ¿Cuándo es el sorteo?
            </button>
            <button className="w-full text-left bg-gray-100 hover:bg-gray-200 p-2 rounded text-sm">
              ¿Cómo puedo consultar mis números?
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-black text-white text-center py-8">
        <div className="container mx-auto px-4">
          <div className="text-2xl font-bold mb-2">
            PROYECTOS <span className="text-flores-green">FLORES</span>
          </div>
          <p className="text-gray-400">Cumpliendo sueños desde Ecuador</p>
        </div>
      </footer>
    </div>
  );
}

export default App;