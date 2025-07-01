import { Link } from 'react-router-dom';
import logoImage from '@/assets/logo/murela_logo_official.png';
import { ShoppingCart, ShoppingBag, X, Menu, Trash2, ArrowLeft, Filter, Upload } from 'lucide-react';
import poloUniformeImage from '@/assets/images/polo_uniforme_simbolo.png';
import scrubUniformeImage from '@/assets/images/scrub_uniforme_final.png';
import profissionaisImage from '@/assets/images/profissionais_uniformizados.png';
import { uploadImage } from '@/services/api';

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
  selectedSize?: string;
  selectedColor?: string;
  selectedModel?: string;
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

import { useState, useEffect } from 'react';

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

  // Novos estados para o formulário de adição de produto
  const [newProductFormOpen, setNewProductFormOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id' | 'image'> & { imageFile: File | null; imageUrlPreview: string | null }> ({
    name: '',
    price: 0,
    description: '',
    sizes: [],
    colors: [],
    models: [],
    imageFile: null,
    imageUrlPreview: null,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Verificar status de admin no localStorage
  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdminAuthenticated');
    setIsAdmin(adminStatus === 'true');
  }, []);

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
    // Inicializa as opções com os primeiros valores disponíveis ou mantém as atuais se já selecionadas
    setSelectedOptions(prevOptions => ({
      size: product.sizes.length > 0 ? (prevOptions.size && product.sizes.includes(prevOptions.size) ? prevOptions.size : product.sizes[0]) : '',
      color: product.colors.length > 0 ? (prevOptions.color && product.colors.includes(prevOptions.color) ? prevOptions.color : product.colors[0]) : '',
      model: product.models.length > 0 ? (prevOptions.model && product.models.includes(prevOptions.model) ? prevOptions.model : product.models[0]) : ''
    }));
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

  // Função para lidar com o upload da imagem
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewProduct(prev => ({
        ...prev,
        imageFile: file,
        imageUrlPreview: URL.createObjectURL(file)
      }));
      setUploadError(null);
    } else {
      setNewProduct(prev => ({ ...prev, imageFile: null, imageUrlPreview: null }));
    }
  };

  // Função para lidar com mudanças nos inputs do formulário de novo produto
  const handleNewProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value
    }));
  };

  // Função para lidar com mudanças nos arrays (sizes, colors, models)
  const handleNewProductArrayChange = (name: keyof typeof newProduct, value: string) => {
    setNewProduct(prev => ({
      ...prev,
      [name]: (prev[name] as string[]).includes(value) ?
        (prev[name] as string[]).filter(item => item !== value) :
        [...(prev[name] as string[]), value]
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
      // const uniqueId = `${productWithOptions.id}-${selectedOptions.size}-${selectedOptions.color}-${selectedOptions.model}`;
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
        return [...prev, {...productWithOptions, quantity: 1}];
      }
    });
    
    // Fecha o modal de detalhes
    closeProductDetail();
    // Abre o carrinho
    setCartOpen(true);
  };

  // Função para adicionar um novo produto
  const addNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadingImage(true);
    setUploadError(null);

    if (!newProduct.imageFile) {
      setUploadError('Por favor, selecione uma imagem para o produto.');
      setUploadingImage(false);
      return;
    }

    try {
      const uploadResponse = await uploadImage(newProduct.imageFile);
      if (uploadResponse.success && uploadResponse.url) {
        const newProductId = shopProducts.length > 0 ? Math.max(...shopProducts.map(p => p.id)) + 1 : 1;
        const productToAdd: Product = {
          id: newProductId,
          name: newProduct.name,
          price: newProduct.price,
          description: newProduct.description,
          sizes: newProduct.sizes,
          colors: newProduct.colors,
          models: newProduct.models,
          image: uploadResponse.url,
        };

        setShopProducts(prev => {
          const updatedProducts = [...prev, productToAdd];
          localStorage.setItem('shopProducts', JSON.stringify(updatedProducts));
          return updatedProducts;
        });

        // Limpar formulário e fechar modal
        setNewProduct({
          name: '',
          price: 0,
          description: '',
          sizes: [],
          colors: [],
          models: [],
          imageFile: null,
          imageUrlPreview: null,
        });
        setNewProductFormOpen(false);
      } else {
        setUploadError(uploadResponse.message || 'Erro ao fazer upload da imagem.');
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      setUploadError('Erro ao fazer upload da imagem. Tente novamente.');
    } finally {
      setUploadingImage(false);
    }
  };

  const updateQuantity = (productId: number, amount: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.max(0, item.quantity + amount) } // Ensure quantity doesn't go below 0
          : item
      ).filter(item => item.quantity > 0) // Remove item if quantity is 0
    );
  };

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id && !item.selectedSize && !item.selectedColor && !item.selectedModel); // Check for item without specific options
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id && !item.selectedSize && !item.selectedColor && !item.selectedModel
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setCartOpen(true); // Optionally open cart
  };

  return (
    <>
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
          </div>
        </div>
        <div className={`mobile-menu ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Link to="/" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Início</Link>
          <Link to="/" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Contato</Link>
          <Link to="/loja" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Loja Virtual</Link>
        </div>
      </header>

      {/* Modal de Adicionar Novo Produto */}
      {newProductFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => setNewProductFormOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold mb-6">Adicionar Novo Produto</h2>
            <form onSubmit={addNewProduct} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-muted-foreground">Nome do Produto</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newProduct.name}
                  onChange={handleNewProductChange}
                  className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background"
                  required
                />
              </div>
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-muted-foreground">Preço</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={newProduct.price}
                  onChange={handleNewProductChange}
                  className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-muted-foreground">Descrição</label>
                <textarea
                  id="description"
                  name="description"
                  value={newProduct.description}
                  onChange={handleNewProductChange}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background"
                  required
                ></textarea>
              </div>
              
              {/* Upload de Imagem */}
              <div>
                <label htmlFor="imageUpload" className="block text-sm font-medium text-muted-foreground mb-2">Imagem do Produto</label>
                <input
                  type="file"
                  id="imageUpload"
                  name="imageUpload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                {newProduct.imageUrlPreview && (
                  <div className="mt-4">
                    <img src={newProduct.imageUrlPreview} alt="Pré-visualização da Imagem" className="max-w-xs h-auto rounded-md shadow-md" />
                  </div>
                )}
                {uploadError && <p className="text-red-500 text-sm mt-2">{uploadError}</p>}
              </div>

              {/* Tamanhos */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Tamanhos Disponíveis</h3>
                <div className="flex flex-wrap gap-2">
                  {['P', 'M', 'G', 'GG', 'XG'].map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleNewProductArrayChange('sizes', size)}
                      className={`px-3 py-1 border rounded-md transition-colors ${newProduct.sizes.includes(size) ? 'bg-primary text-primary-foreground border-primary' : 'border-input hover:bg-accent'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cores */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Cores Disponíveis</h3>
                <div className="flex flex-wrap gap-2">
                  {['Azul', 'Preto', 'Branco', 'Vermelho', 'Verde', 'Rosa', 'Cinza', 'Laranja', 'Azul Claro', 'Listrado'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleNewProductArrayChange('colors', color)}
                      className={`px-3 py-1 border rounded-md transition-colors ${newProduct.colors.includes(color) ? 'bg-primary text-primary-foreground border-primary' : 'border-input hover:bg-accent'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modelos */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Modelos Disponíveis</h3>
                <div className="flex flex-wrap gap-2">
                  {['Slim', 'Regular', 'Tradicional', 'Unissex', 'Feminino', 'Masculino', 'Executivo', 'Casual', 'Operacional', 'Manga Longa', 'Manga Curta', 'Com Refletivo', 'Sem Refletivo'].map(model => (
                    <button
                      key={model}
                      type="button"
                      onClick={() => handleNewProductArrayChange('models', model)}
                      className={`px-3 py-1 border rounded-md transition-colors ${newProduct.models.includes(model) ? 'bg-primary text-primary-foreground border-primary' : 'border-input hover:bg-accent'}`}
                    >
                      {model}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setNewProductFormOpen(false)}
                  className="bg-secondary text-foreground hover:bg-secondary/80 font-bold py-2 px-4 rounded-md transition duration-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-2 px-4 rounded-md transition duration-300"
                  disabled={uploadingImage}
                >
                  {uploadingImage ? 'Adicionando...' : 'Adicionar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>


      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center text-primary hover:text-primary/80 transition-colors">
                <ArrowLeft className="h-5 w-5 mr-1" />
                Voltar
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-primary">Loja Virtual</h1>
            </div>
            {isAdmin && (
              <button
                onClick={() => setNewProductFormOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-2 px-4 rounded-md transition duration-300"
              >
                Adicionar Novo Produto
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product: Product) => (
              <div key={product.id} className="bg-card rounded-lg shadow-lg overflow-hidden flex flex-col">
                <div 
                  className="relative w-full h-48 bg-muted flex items-center justify-center cursor-pointer"
                  onClick={() => openProductDetail(product)}
                >
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-muted-foreground text-sm">Sem Imagem</div>
                  )}
                </div>
                <div className="p-4 flex-grow flex flex-col">
                  <h3 
                    className="text-xl font-semibold text-foreground mb-2 cursor-pointer"
                    onClick={() => openProductDetail(product)}
                  >
                    {product.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-2 line-clamp-2">{product.description}</p>
                  <p className="text-primary text-lg font-bold mb-4">R$ {product.price.toFixed(2)}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.sizes && product.sizes.map((size: string) => (
                      <span key={size} className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">{size}</span>
                    ))}
                    {product.colors && product.colors.map((color: string) => (
                      <span key={color} className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">{color}</span>
                    ))}
                    {product.models && product.models.map((model: string) => (
                      <span key={model} className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">{model}</span>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center border border-input rounded-md">
                      <button
                        onClick={() => updateQuantity(product.id, -1)}
                        className="px-3 py-1 text-foreground hover:bg-accent rounded-l-md"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 border-x border-input text-foreground">
                        {cartItems.find(item => item.id === product.id)?.quantity || 0}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, 1)}
                        className="px-3 py-1 text-foreground hover:bg-accent rounded-r-md"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-2 px-4 rounded-md transition duration-300"
                    >
                      Adicionar ao Carrinho
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Loja;