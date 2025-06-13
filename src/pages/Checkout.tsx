import { useState, useEffect } from 'react';
import { CartItem } from './Loja';
import { Link, useNavigate } from 'react-router-dom';
import logoImage from '@/assets/logo/murela_logo_official.png';
import { ShoppingCart, ArrowLeft, CreditCard, Truck, MapPin, Check, X, AlertCircle } from 'lucide-react';
import { fetchAddressByCEP, calculateShipping, processPayment } from '@/services/api';

function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [step, setStep] = useState(1); // 1: Endereço, 2: Frete, 3: Pagamento, 4: Confirmação
  
  // Estado para endereço
  const [addressForm, setAddressForm] = useState({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });
  
  // Estado para frete
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  
  // Estado para pagamento
  const [paymentMethod, setPaymentMethod] = useState('credit_card'); // credit_card, pix, boleto
  const [cardForm, setCardForm] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    installments: '1',
  });
  
  // Estado para mensagens
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Carregar itens do carrinho do localStorage
  useEffect(() => {
    const storedCartItems = localStorage.getItem('cartItems');
    if (storedCartItems) {
      const items = JSON.parse(storedCartItems);
      setCartItems(items);
      
      // Calcular total
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setCartTotal(total);
    } else {
      // Redirecionar para a loja se o carrinho estiver vazio
      navigate('/loja');
    }
  }, [navigate]);
  
  // Função para buscar endereço pelo CEP
  const fetchAddressByCEP = async () => {
    if (addressForm.cep.length !== 8) {
      setMessage({ type: 'error', text: 'CEP inválido. Digite um CEP com 8 dígitos.' });
      return;
    }
    
    try {
      setMessage({ type: 'info', text: 'Buscando endereço...' });
      const response = await fetchAddressByCEP(addressForm.cep);
      
      if (response.success) {
        setAddressForm({
          ...addressForm,
          street: response.address.street,
          neighborhood: response.address.neighborhood,
          city: response.address.city,
          state: response.address.state,
        });
        setMessage({ type: 'success', text: 'Endereço encontrado!' });
      } else {
        setMessage({ type: 'error', text: response.message || 'Erro ao buscar o CEP.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao buscar o CEP. Tente novamente.' });
    }
  };
  
  // Função para calcular opções de frete
  const calculateShipping = async () => {
    setLoadingShipping(true);
    setMessage({ type: 'info', text: 'Calculando opções de frete...' });
    
    try {
      // Obter o CEP de origem (da loja)
      const cepOrigin = '01001000'; // CEP fixo da loja (exemplo)
      
      // Calcular o peso total dos itens no carrinho
      const totalWeight = cartItems.reduce((sum, item) => sum + (item.weight || 0.5) * item.quantity, 0);
      
      // Preparar a requisição para o cálculo de frete
      const shippingRequest = {
        cepOrigin,
        cepDestination: addressForm.cep,
        weight: totalWeight || 1, // Peso mínimo de 1kg
        length: 20, // Valores padrão para a embalagem
        height: 10,
        width: 15,
        diameter: 10,
        format: 1 as 1 | 2 | 3, // 1 = caixa/pacote
      };
      
      const response = await calculateShipping(shippingRequest);
      
      if (response.success && response.options) {
        setShippingOptions(response.options);
        setSelectedShipping(response.options[0].id); // Seleciona a primeira opção por padrão
        setMessage({ type: 'success', text: 'Opções de frete calculadas!' });
      } else {
        setMessage({ type: 'error', text: response.message || 'Erro ao calcular o frete.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao calcular o frete. Tente novamente.' });
    } finally {
      setLoadingShipping(false);
    }
  };
  
  // Função para processar pagamento
  const processPaymentHandler = async () => {
    setMessage({ type: 'info', text: 'Processando pagamento...' });
    
    try {
      // Obter a opção de frete selecionada
      const selectedOption = shippingOptions.find(opt => opt.id === selectedShipping);
      
      if (!selectedOption) {
        setMessage({ type: 'error', text: 'Selecione uma opção de frete.' });
        return;
      }
      
      // Preparar os itens do carrinho para a requisição
      const items = cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));
      
      // Preparar a requisição de pagamento
      const paymentRequest = {
        paymentMethod: paymentMethod as 'credit_card' | 'pix' | 'boleto',
        total: getTotalWithShipping(),
        items,
        customer: {
          name: 'Cliente Teste', // Em uma implementação real, esses dados viriam de um formulário
          email: 'cliente@teste.com',
          address: {
            street: addressForm.street,
            number: addressForm.number,
            complement: addressForm.complement,
            neighborhood: addressForm.neighborhood,
            city: addressForm.city,
            state: addressForm.state,
            zipcode: addressForm.cep
          }
        },
        creditCard: paymentMethod === 'credit_card' ? {
          number: cardForm.number,
          name: cardForm.name,
          expiry: cardForm.expiry,
          cvv: cardForm.cvv,
          installments: cardForm.installments
        } : undefined
      };
      
      const response = await processPayment(paymentRequest);
      
      if (response.success) {
        setMessage({ type: 'success', text: response.message || 'Redirecionando para o checkout do EFI...' });
        // Não avançamos para o passo 4 automaticamente, pois o pagamento será finalizado no EFI
        // O usuário será redirecionado para o checkout do EFI em uma nova janela
        
        // Armazenamos os dados do pedido no localStorage para recuperação posterior
        localStorage.setItem('pendingOrder', JSON.stringify({
          items: cartItems,
          total: getTotalWithShipping(),
          shipping: selectedOption,
          address: addressForm,
          paymentMethod
        }));
      } else {
        setMessage({ type: 'error', text: response.message || 'Erro ao processar o pagamento.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao processar o pagamento. Tente novamente.' });
    }
  };
  
  // Função para lidar com mudanças nos campos de endereço
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressForm({
      ...addressForm,
      [name]: value
    });
    
    // Se o campo for CEP e tiver 8 dígitos, buscar endereço
    if (name === 'cep' && value.length === 8) {
      fetchAddressByCEP();
    }
  };
  
  // Função para lidar com mudanças nos campos de cartão
  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardForm({
      ...cardForm,
      [name]: value
    });
  };
  
  // Função para avançar para o próximo passo
  const nextStep = () => {
    if (step === 1) {
      // Validar formulário de endereço
      if (!addressForm.cep || !addressForm.street || !addressForm.number || !addressForm.city || !addressForm.state) {
        setMessage({ type: 'error', text: 'Preencha todos os campos obrigatórios do endereço.' });
        return;
      }
      calculateShipping();
    } else if (step === 2) {
      // Validar seleção de frete
      if (!selectedShipping) {
        setMessage({ type: 'error', text: 'Selecione uma opção de frete.' });
        return;
      }
    } else if (step === 3) {
      // Validar formulário de pagamento
      if (paymentMethod === 'credit_card') {
        if (!cardForm.number || !cardForm.name || !cardForm.expiry || !cardForm.cvv) {
          setMessage({ type: 'error', text: 'Preencha todos os campos do cartão.' });
          return;
        }
      }
      processPayment();
      return;
    }
    
    setStep(step + 1);
    setMessage({ type: '', text: '' });
  };
  
  // Função para voltar ao passo anterior
  const prevStep = () => {
    setStep(step - 1);
    setMessage({ type: '', text: '' });
  };
  
  // Função para finalizar a compra
  const finishOrder = () => {
    navigate('/loja');
  };
  
  // Função para obter o valor do frete selecionado
  const getSelectedShippingPrice = () => {
    if (!selectedShipping) return 0;
    const option = shippingOptions.find(opt => opt.id === selectedShipping);
    return option ? option.price : 0;
  };
  
  // Função para obter o total com frete
  const getTotalWithShipping = () => {
    return cartTotal + getSelectedShippingPrice();
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className={`py-4 bg-background border-b border-border sticky top-0 z-10`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2">
              <img src={logoImage} alt="Murela Brands Logo" className="h-10" />
            </Link>
            <Link to="/loja" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Voltar para a loja
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-8">Finalizar Compra</h1>
        
        {/* Progresso */}
        <div className="mb-8">
          <div className="flex justify-between">
            <div className={`flex flex-col items-center ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                <MapPin className="h-4 w-4" />
              </div>
              <span className="text-xs">Endereço</span>
            </div>
            <div className={`flex flex-col items-center ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                <Truck className="h-4 w-4" />
              </div>
              <span className="text-xs">Frete</span>
            </div>
            <div className={`flex flex-col items-center ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                <CreditCard className="h-4 w-4" />
              </div>
              <span className="text-xs">Pagamento</span>
            </div>
            <div className={`flex flex-col items-center ${step >= 4 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${step >= 4 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                <Check className="h-4 w-4" />
              </div>
              <span className="text-xs">Confirmação</span>
            </div>
          </div>
          <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-in-out" 
              style={{ width: `${(step - 1) * 33.33}%` }}
            ></div>
          </div>
        </div>
        
        {/* Mensagem */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-md flex items-center gap-2 ${
            message.type === 'error' ? 'bg-red-100 text-red-800' : 
            message.type === 'success' ? 'bg-green-100 text-green-800' : 
            'bg-blue-100 text-blue-800'
          }`}>
            {message.type === 'error' && <AlertCircle className="h-5 w-5" />}
            {message.type === 'success' && <Check className="h-5 w-5" />}
            {message.type === 'info' && <AlertCircle className="h-5 w-5" />}
            {message.text}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {/* Passo 1: Endereço */}
            {step === 1 && (
              <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
                <h2 className="text-xl font-semibold text-card-foreground mb-4">Endereço de Entrega</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-muted-foreground mb-1">CEP *</label>
                    <div className="flex">
                      <input 
                        type="text" 
                        id="cep"
                        name="cep" 
                        value={addressForm.cep} 
                        onChange={handleAddressChange} 
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                        placeholder="00000000" 
                        maxLength={8}
                        autoComplete="postal-code"
                      />
                      <button 
                        onClick={fetchAddressByCEP} 
                        className="ml-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                      >
                        Buscar
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Rua/Avenida *</label>
                    <input 
                      type="text" 
                      id="street"
                      name="street" 
                      value={addressForm.street} 
                      onChange={handleAddressChange} 
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                      placeholder="Rua Exemplo"
                      autoComplete="street-address"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Número *</label>
                    <input 
                      type="text" 
                      id="number"
                      name="number" 
                      value={addressForm.number} 
                      onChange={handleAddressChange} 
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                      placeholder="123"
                      autoComplete="address-line2"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Complemento</label>
                    <input 
                      type="text" 
                      id="complement"
                      name="complement" 
                      value={addressForm.complement} 
                      onChange={handleAddressChange} 
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                      placeholder="Apto 101"
                      autoComplete="address-line3"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Bairro *</label>
                    <input 
                      type="text" 
                      id="neighborhood"
                      name="neighborhood" 
                      value={addressForm.neighborhood} 
                      onChange={handleAddressChange} 
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                      placeholder="Bairro"
                      autoComplete="address-level3"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Cidade *</label>
                    <input 
                      type="text" 
                      id="city"
                      name="city" 
                      value={addressForm.city} 
                      onChange={handleAddressChange} 
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                      placeholder="Cidade"
                      autoComplete="address-level2"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Estado *</label>
                    <select 
                      id="state"
                      name="state" 
                      value={addressForm.state} 
                      onChange={handleAddressChange} 
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      autoComplete="address-level1"
                    >
                      <option value="">Selecione</option>
                      <option value="AC">Acre</option>
                      <option value="AL">Alagoas</option>
                      <option value="AP">Amapá</option>
                      <option value="AM">Amazonas</option>
                      <option value="BA">Bahia</option>
                      <option value="CE">Ceará</option>
                      <option value="DF">Distrito Federal</option>
                      <option value="ES">Espírito Santo</option>
                      <option value="GO">Goiás</option>
                      <option value="MA">Maranhão</option>
                      <option value="MT">Mato Grosso</option>
                      <option value="MS">Mato Grosso do Sul</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="PA">Pará</option>
                      <option value="PB">Paraíba</option>
                      <option value="PR">Paraná</option>
                      <option value="PE">Pernambuco</option>
                      <option value="PI">Piauí</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="RN">Rio Grande do Norte</option>
                      <option value="RS">Rio Grande do Sul</option>
                      <option value="RO">Rondônia</option>
                      <option value="RR">Roraima</option>
                      <option value="SC">Santa Catarina</option>
                      <option value="SP">São Paulo</option>
                      <option value="SE">Sergipe</option>
                      <option value="TO">Tocantins</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {/* Passo 2: Frete */}
            {step === 2 && (
              <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
                <h2 className="text-xl font-semibold text-card-foreground mb-4">Opções de Frete</h2>
                {loadingShipping ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2 text-muted-foreground">Calculando frete...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {shippingOptions.map((option) => (
                      <div 
                        key={option.id} 
                        className={`p-4 border rounded-md cursor-pointer transition-colors ${
                          selectedShipping === option.id ? 'border-primary bg-primary/5' : 'border-input'
                        }`}
                        onClick={() => setSelectedShipping(option.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                              selectedShipping === option.id ? 'border-primary' : 'border-input'
                            }`}>
                              {selectedShipping === option.id && (
                                <div className="w-3 h-3 rounded-full bg-primary"></div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium">{option.name}</h3>
                              <p className="text-sm text-muted-foreground">Entrega em até {option.days} {option.days === 1 ? 'dia útil' : 'dias úteis'}</p>
                            </div>
                          </div>
                          <span className="font-medium">R$ {option.price.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Passo 3: Pagamento */}
            {step === 3 && (
              <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
                <h2 className="text-xl font-semibold text-card-foreground mb-4">Método de Pagamento</h2>
                <div className="mb-6">
                  <div className="flex space-x-4 mb-6">
                    <button 
                      className={`px-4 py-2 rounded-md flex items-center gap-2 ${paymentMethod === 'credit_card' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
                      onClick={() => setPaymentMethod('credit_card')}
                    >
                      <CreditCard className="h-4 w-4" /> Cartão de Crédito
                    </button>
                    <button 
                      className={`px-4 py-2 rounded-md flex items-center gap-2 ${paymentMethod === 'pix' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
                      onClick={() => setPaymentMethod('pix')}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.5 5L15.5 12L9.5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg> PIX
                    </button>
                  </div>
                  
                  {paymentMethod === 'credit_card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Número do Cartão *</label>
                        <input 
                          type="text" 
                          id="card-number"
                          name="number" 
                          value={cardForm.number} 
                          onChange={handleCardChange} 
                          className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                          placeholder="0000 0000 0000 0000"
                          maxLength={19}
                          autoComplete="cc-number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Nome no Cartão *</label>
                        <input 
                          type="text" 
                          id="card-name"
                          name="name" 
                          value={cardForm.name} 
                          onChange={handleCardChange} 
                          className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                          placeholder="NOME COMO ESTÁ NO CARTÃO"
                          autoComplete="cc-name"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">Validade *</label>
                          <input 
                            type="text" 
                            id="card-expiry"
                            name="expiry" 
                            value={cardForm.expiry} 
                            onChange={handleCardChange} 
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                            placeholder="MM/AA"
                            maxLength={5}
                            autoComplete="cc-exp"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">CVV *</label>
                          <input 
                            type="text" 
                            id="card-cvv"
                            name="cvv" 
                            value={cardForm.cvv} 
                            onChange={handleCardChange} 
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                            placeholder="123"
                            maxLength={4}
                            autoComplete="cc-csc"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Parcelas *</label>
                        <select 
                          id="card-installments"
                          name="installments" 
                          value={cardForm.installments} 
                          onChange={handleCardChange} 
                          className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="1">1x de R$ {getTotalWithShipping().toFixed(2)} sem juros</option>
                          <option value="2">2x de R$ {(getTotalWithShipping() / 2).toFixed(2)} sem juros</option>
                          <option value="3">3x de R$ {(getTotalWithShipping() / 3).toFixed(2)} sem juros</option>
                          <option value="4">4x de R$ {(getTotalWithShipping() / 4).toFixed(2)} sem juros</option>
                          <option value="5">5x de R$ {(getTotalWithShipping() / 5).toFixed(2)} sem juros</option>
                          <option value="6">6x de R$ {(getTotalWithShipping() / 6).toFixed(2)} sem juros</option>
                        </select>
                      </div>
                    </div>
                  )}
                  
                  {paymentMethod === 'pix' && (
                    <div className="text-center py-6">
                      <div className="bg-gray-100 p-4 rounded-md inline-block mb-4">
                        <svg className="h-32 w-32 mx-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                          <path d="M9.5 5L15.5 12L9.5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <p className="text-muted-foreground mb-2">QR Code PIX será gerado após a confirmação do pedido</p>
                      <p className="font-medium">Total a pagar: R$ {getTotalWithShipping().toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Passo 4: Confirmação */}
            {step === 4 && (
              <div className="bg-card rounded-lg shadow-sm p-6 border border-border text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-card-foreground mb-2">Pedido Confirmado!</h2>
                <p className="text-muted-foreground mb-6">Seu pedido foi realizado com sucesso e está sendo processado.</p>
                
                <div className="mb-6 p-4 bg-muted rounded-md text-left">
                  <h3 className="font-medium mb-2">Resumo do Pedido</h3>
                  <p className="text-sm text-muted-foreground mb-1">Número do Pedido: #{Math.floor(Math.random() * 1000000)}</p>
                  <p className="text-sm text-muted-foreground mb-1">Data: {new Date().toLocaleDateString()}</p>
                  <p className="text-sm text-muted-foreground mb-1">Método de Pagamento: {
                    paymentMethod === 'credit_card' ? 'Cartão de Crédito' : 'PIX'
                  }</p>
                  <p className="text-sm text-muted-foreground">Total: R$ {getTotalWithShipping().toFixed(2)}</p>
                </div>
                
                <button 
                  onClick={finishOrder} 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-2 px-6 rounded-md transition duration-300"
                >
                  Voltar para a Loja
                </button>
              </div>
            )}
            
            {/* Botões de navegação */}
            {step < 4 && (
              <div className="mt-6 flex justify-between">
                {step > 1 ? (
                  <button 
                    onClick={prevStep} 
                    className="px-4 py-2 border border-input rounded-md hover:bg-accent transition-colors"
                  >
                    Voltar
                  </button>
                ) : (
                  <Link 
                    to="/loja" 
                    className="px-4 py-2 border border-input rounded-md hover:bg-accent transition-colors flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" /> Voltar para o Carrinho
                  </Link>
                )}
                <button 
                  onClick={step === 3 ? processPaymentHandler : nextStep} 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-2 px-6 rounded-md transition duration-300"
                >
                  {step === 3 ? 'Finalizar Pedido' : 'Continuar'}
                </button>
              </div>
            )}
          </div>
          
          {/* Resumo do Pedido */}
          <div className="md:col-span-1">
            <div className="bg-card rounded-lg shadow-sm p-6 border border-border sticky top-24">
              <h2 className="text-xl font-semibold text-card-foreground mb-4">Resumo do Pedido</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="h-full w-full object-cover" 
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-sm font-medium text-foreground">{item.name}</h4>
                      {item.selectedSize && <p className="text-xs text-muted-foreground">Tamanho: {item.selectedSize}</p>}
                      {item.selectedColor && <p className="text-xs text-muted-foreground">Cor: {item.selectedColor}</p>}
                      {item.selectedModel && <p className="text-xs text-muted-foreground">Modelo: {item.selectedModel}</p>}
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-muted-foreground">Qtd: {item.quantity}</span>
                        <span className="text-sm font-medium text-foreground">R$ {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">R$ {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frete</span>
                  <span className="font-medium">
                    {step >= 2 && selectedShipping ? 
                      `R$ ${getSelectedShippingPrice().toFixed(2)}` : 
                      'Calculando...'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 mt-2">
                  <span className="font-medium">Total</span>
                  <span className="text-lg font-bold text-primary">
                    {step >= 2 && selectedShipping ? 
                      `R$ ${getTotalWithShipping().toFixed(2)}` : 
                      `R$ ${cartTotal.toFixed(2)}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 bg-secondary border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} Murela Brands. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default Checkout;