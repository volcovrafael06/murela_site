import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logoImage from '@/assets/logo/murela_logo_official.png';
import { ShoppingCart, ShoppingBag, X, Menu, Trash2, ArrowLeft, Filter } from 'lucide-react';
import poloUniformeImage from '@/assets/images/polo_uniforme_simbolo.png';
import scrubUniformeImage from '@/assets/images/scrub_uniforme_final.png';
import profissionaisImage from '@/assets/images/profissionais_uniformizados.png';

// Definição de interfaces para tipagem
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  sizes: string[];
  colors: string[];
  models: string[];
}

interface CartItem extends Product {
  quantity: number;
}

// Produtos iniciais para demonstração (serão usados apenas se não houver dados no localStorage)
const initialProducts: Product[] = [
  { 
    id: 1, 
    name: 'Camisa Polo Empresarial', 
    price: 89.90, 
    image: poloUniformeImage, 
    description: 'Camisa polo de alta qualidade para uniformes empresariais.',
    sizes: ['P', 'M', 'G', 'GG'],
    colors: ['Azul', 'Preto', 'Branco', 'Vermelho'],
    models: ['Slim', 'Regular', 'Tradicional']
  },
  { 
    id: 2, 
    name: 'Scrub Hospitalar', 
    price: 129.90, 
    image: scrubUniformeImage, 
    description: 'Uniforme hospitalar confortável e durável para profissionais da saúde.',
    sizes: ['P', 'M', 'G', 'GG'],
    colors: ['Verde', 'Azul', 'Branco', 'Rosa'],
    models: ['Unissex', 'Feminino', 'Masculino']
  },
  { 
    id: 3, 
    name: 'Kit Uniforme Corporativo', 
    price: 249.90, 
    image: profissionaisImage, 
    description: 'Kit completo de uniformes para sua equipe.',
    sizes: ['P', 'M', 'G', 'GG'],
    colors: ['Azul', 'Preto', 'Cinza'],
    models: ['Executivo', 'Casual', 'Operacional']
  },
  { 
    id: 4, 
    name: 'Camisa Social', 
    price: 119.90, 
    image: poloUniformeImage, 
    description: 'Camisa social elegante para ambientes corporativos.',
    sizes: ['P', 'M', 'G', 'GG'],
    colors: ['Branco', 'Azul Claro', 'Listrado'],
    models: ['Manga Longa', 'Manga Curta']
  },
  { 
    id: 5, 
    name: 'Jaleco Profissional', 
    price: 149.90, 
    image: scrubUniformeImage, 
    description: 'Jaleco profissional para área da saúde e laboratórios.',
    sizes: ['P', 'M', 'G', 'GG'],
    colors: ['Branco', 'Azul'],
    models: ['Tradicional', 'Moderno']
  },
  { 
    id: 6, 
    name: 'Uniforme Industrial', 
    price: 179.90, 
    image: profissionaisImage, 
    description: 'Uniforme resistente para ambientes industriais.',
    sizes: ['P', 'M', 'G', 'GG', 'XG'],
    colors: ['Laranja', 'Azul', 'Cinza'],
    models: ['Com Refletivo', 'Sem Refletivo']
  },
];

function Loja() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [filters, setFilters] = useState({
    size: '',
    color: '',
    model: ''
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [shopProducts, setShopProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  // Estado para o modal de detalhes do produto
  const [productDetailOpen, setProductDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOptions, setSelectedOptions] = useState({
    size: '',
    color: '',
    model: ''
  });

  // Carregar produtos do localStorage ou usar os iniciais
  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem('shopProducts');
      if (storedProducts) {
        setShopProducts(JSON.parse(storedProducts));
      } else {
        setShopProducts(initialProducts);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setShopProducts(initialProducts);
    }
  }, []);

  // Extrair opções únicas para os filtros
  const sizeOptions = [...new Set(shopProducts.flatMap(product => product.sizes))];
  const colorOptions = [...new Set(shopProducts.flatMap(product => product.colors))];
  const modelOptions = [...new Set(shopProducts.flatMap(product => product.models))];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Aplicar filtros aos produtos
    let result = [...shopProducts];
    
    if (filters.size) {
      result = result.filter(product => product.sizes.includes(filters.size));
    }
    
    if (filters.color) {
      result = result.filter(product => product.colors.includes(filters.color));
    }
    
    if (filters.model) {
      result = result.filter(product => product.models.includes(filters.model));
    }
    
    setFilteredProducts(result);
  }, [filters, shopProducts]);

  // Função para adicionar item ao carrinho
  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item => 
          item.id === product.id ? {...item, quantity: item.quantity + 1} : item
        );
      } else {
        return [...prev, {...product, quantity: 1}];
      }
    });
  };

  // Função para remover item do carrinho
  const removeFromCart = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  // Função para calcular o total do carrinho
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Função para limpar todos os filtros
  const clearFilters = () => {
    setFilters({
      size: '',
      color: '',
      model: ''
    });
  };

  // Função para abrir o modal de detalhes do produto
  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
    // Inicializa as opções com os primeiros valores disponíveis
    setSelectedOptions({
      size: product.sizes.length > 0 ? product.sizes[0] : '',
      color: product.colors.length > 0 ? product.colors[0] : '',
      model: product.models.length > 0 ? product.models[0] : ''
    });
    setProductDetailOpen(true);
  };

  // Função para fechar o modal de detalhes do produto
  const closeProductDetail = () => {
    setProductDetailOpen(false);
    setSelectedProduct(null);
  };

  // Função para atualizar as opções selecionadas
  const updateSelectedOption = (option: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  // Função para adicionar o produto ao carrinho com as opções selecionadas
  const addToCartWithOptions = () => {
    if (!selectedProduct) return;
    
    const productWithOptions = {
      ...selectedProduct,
      selectedSize: selectedOptions.size,
      selectedColor: selectedOptions.color,
      selectedModel: selectedOptions.model
    };
    
    setCartItems(prev => {
      // Cria um ID único para o produto com as opções selecionadas
      const uniqueId = `${productWithOptions.id}-${selectedOptions.size}-${selectedOptions.color}-${selectedOptions.model}`;
      const existingItemIndex = prev.findIndex(item => 
        item.id === productWithOptions.id && 
        item.selectedSize === selectedOptions.size && 
        item.selectedColor === selectedOptions.color && 
        item.selectedModel === selectedOptions.model
      );
      
      if (existingItemIndex >= 0) {
        // Se o produto com as mesmas opções já existe, aumenta a quantidade
        const updatedItems = [...prev];
        updatedItems[existingItemIndex].quantity += 1;
        return updatedItems;
      } else {
        // Caso contrário, adiciona um novo item
        return [...prev, {...productWithOptions, quantity: 1, uniqueId}];
      }
    });
    
    // Fecha o modal de detalhes
    closeProductDetail();
    // Abre o carrinho
    setCartOpen(true);
  };

  return (
    <div className="App bg-background text-foreground">
      <header className={`navbar fixed w-full z-50 transition-all duration-300 ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="logo-container">
            <Link to="/">
              <img src={logoImage} alt="Murela Brands Logo" className="logo-image" />
            </Link>
          </div>
          <nav className="hidden md:flex space-x-2">
            <Link to="/" className="nav-link capitalize">
              <span>Início</span>
            </Link>
            <Link to="/" className="nav-link capitalize">
              <span>Contato</span>
            </Link>
            <Link to="/loja" className="nav-link capitalize active">
              <span>Loja Virtual</span>
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <button 
              className="relative text-foreground focus:outline-none"
              onClick={() => setCartOpen(!cartOpen)}
              aria-label="Carrinho de compras"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </button>
            <button 
              className="md:hidden text-foreground focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        <div className={`mobile-menu ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Link to="/" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Início</Link>
          <Link to="/" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Contato</Link>
          <Link to="/loja" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Loja Virtual</Link>
        </div>
      </header>

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center text-primary hover:text-primary/80 transition-colors">
                <ArrowLeft className="h-5 w-5 mr-1" />
                <span>Voltar para o site</span>
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-primary">Loja Virtual</h1>
            </div>
            <button 
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="md:hidden flex items-center gap-2 bg-secondary px-4 py-2 rounded-md"
            >
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Filtros - Visível em desktop, oculto em mobile até clicar no botão */}
            <div className={`
              md:w-1/4 bg-card p-6 rounded-lg shadow-md h-fit
              ${filtersOpen ? 'block' : 'hidden'} md:block
              fixed md:static inset-0 z-40 md:z-auto bg-background md:bg-card
              overflow-auto md:overflow-visible pt-20 md:pt-6
            `}>
              <div className="flex justify-between items-center mb-6 md:hidden">
                <h2 className="text-xl font-semibold">Filtros</h2>
                <button 
                  onClick={() => setFiltersOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Tamanho</h3>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map(size => (
                      <button
                        key={size}
                        onClick={() => setFilters(prev => ({ ...prev, size: prev.size === size ? '' : size }))} 
                        className={`px-3 py-1 border rounded-md transition-colors ${filters.size === size ? 'bg-primary text-primary-foreground border-primary' : 'border-input hover:bg-accent'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Cor</h3>
                  <div className="space-y-2">
                    {colorOptions.map(color => (
                      <div key={color} className="flex items-center">
                        <input 
                          type="checkbox" 
                          id={`color-${color}`} 
                          checked={filters.color === color}
                          onChange={() => setFilters(prev => ({ ...prev, color: prev.color === color ? '' : color }))}
                          className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor={`color-${color}`} className="text-sm">{color}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Modelo</h3>
                  <select 
                    value={filters.model}
                    onChange={(e) => setFilters(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  >
                    <option value="">Todos os modelos</option>
                    {modelOptions.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
                
                <button 
                  onClick={clearFilters}
                  className="w-full bg-secondary hover:bg-secondary/80 text-foreground py-2 px-4 rounded-md transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
            
            {/* Lista de Produtos */}
            <div className="md:w-3/4">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-lg">
                  <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h2>
                  <p className="text-muted-foreground mb-4">Tente ajustar os filtros para encontrar o que procura.</p>
                  <button 
                    onClick={clearFilters}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-2 px-4 rounded-md transition duration-300"
                  >
                    Limpar Filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-card rounded-lg shadow-md overflow-hidden transition duration-300 transform hover:-translate-y-1 hover:shadow-lg cursor-pointer">
                      <div className="h-64 overflow-hidden" onClick={() => openProductDetail(product)}>
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                        />
                      </div>
                      <div className="p-6">
                        <h3 
                          className="text-xl font-semibold text-card-foreground mb-2 hover:text-primary transition-colors"
                          onClick={() => openProductDetail(product)}
                        >
                          {product.name}
                        </h3>
                        <p className="text-muted-foreground mb-4">{product.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {product.sizes.map(size => (
                            <span key={size} className="text-xs bg-secondary px-2 py-1 rounded">{size}</span>
                          ))}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-primary">R$ {product.price.toFixed(2)}</span>
                          <button 
                            onClick={() => openProductDetail(product)}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-2 px-4 rounded-md transition duration-300 flex items-center gap-2"
                          >
                            <ShoppingCart className="h-4 w-4" /> Adicionar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 bg-secondary border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <img src={logoImage} alt="Murela Brands Logo" className="h-12" />
            </div>
            <div className="text-muted-foreground text-sm text-center md:text-right">
              <p>&copy; {new Date().getFullYear()} Murela Brands. Todos os direitos reservados.</p>
              <p className="mt-1">Uniformes profissionais de alta qualidade para sua empresa.</p>
              <Link to="/admin" className="text-primary hover:text-primary/80 transition-colors text-xs mt-2 inline-block">
                Área Administrativa
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Carrinho de Compras Modal */}
      {cartOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-foreground">Carrinho de Compras</h3>
                <button 
                  onClick={() => setCartOpen(false)} 
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Fechar carrinho"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Seu carrinho está vazio</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 border-b border-border pb-4">
                        <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="h-full w-full object-cover" 
                          />
                        </div>
                        <div className="flex-grow">
                          <h4 className="text-sm font-medium text-foreground">{item.name}</h4>
                          <div className="flex justify-between items-center mt-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Qtd: {item.quantity}</span>
                              <span className="text-sm font-medium text-foreground">R$ {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              aria-label="Remover item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-foreground font-medium">Total</span>
                      <span className="text-lg font-bold text-primary">R$ {cartTotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setCartOpen(false)}
                        className="flex-1 px-4 py-2 border border-input rounded-md hover:bg-accent transition-colors"
                      >
                        Continuar Comprando
                      </button>
                      <Link 
                        to="/checkout"
                        onClick={() => {
                          setCartOpen(false);
                        }}
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-2 px-4 rounded-md transition duration-300 text-center"
                      >
                        Finalizar Pedido
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Produto */}
      {productDetailOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-foreground">Detalhes do Produto</h3>
                <button 
                  onClick={closeProductDetail} 
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Fechar detalhes"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-80 overflow-hidden rounded-lg">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">{selectedProduct.name}</h2>
                  <p className="text-lg font-bold text-primary mb-4">R$ {selectedProduct.price.toFixed(2)}</p>
                  
                  <div className="mb-6">
                    <p className="text-muted-foreground">{selectedProduct.description}</p>
                  </div>
                  
                  {selectedProduct.sizes.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-foreground mb-2">Tamanho</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.sizes.map(size => (
                          <button
                            key={size}
                            onClick={() => updateSelectedOption('size', size)}
                            className={`px-3 py-1 border rounded-md transition-colors ${selectedOptions.size === size ? 'bg-primary text-primary-foreground border-primary' : 'border-input hover:bg-accent'}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedProduct.colors.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-foreground mb-2">Cor</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.colors.map(color => (
                          <button
                            key={color}
                            onClick={() => updateSelectedOption('color', color)}
                            className={`px-3 py-1 border rounded-md transition-colors ${selectedOptions.color === color ? 'bg-primary text-primary-foreground border-primary' : 'border-input hover:bg-accent'}`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedProduct.models.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-foreground mb-2">Modelo</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.models.map(model => (
                          <button
                            key={model}
                            onClick={() => updateSelectedOption('model', model)}
                            className={`px-3 py-1 border rounded-md transition-colors ${selectedOptions.model === model ? 'bg-primary text-primary-foreground border-primary' : 'border-input hover:bg-accent'}`}
                          >
                            {model}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-4 mt-4">
                    <button 
                      onClick={closeProductDetail}
                      className="flex-1 px-4 py-2 border border-input rounded-md hover:bg-accent transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={addToCartWithOptions}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" /> Adicionar ao Carrinho
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Loja;