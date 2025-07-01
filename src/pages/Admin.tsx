import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImage from '@/assets/logo/murela_logo_official.png';
import { Save, Trash2, Edit, Plus, X, ArrowLeft, Upload, Eye, Lock } from 'lucide-react';
import poloUniformeImage from '@/assets/images/polo_uniforme_simbolo.png';
import scrubUniformeImage from '@/assets/images/scrub_uniforme_final.png';
import profissionaisImage from '@/assets/images/profissionais_uniformizados.png';

// Definição de interface para o Produto no Admin
interface Product {
  id: number;
  name: string;
  price: number;
  image: string; // Caminho da imagem local ou URL
  imageUrl?: string; // Campo opcional para URL externa da imagem
  description: string;
  sizes: string[];
  colors: string[];
  models: string[];
}

// Simulação de um banco de dados local usando localStorage
const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T | ((prevState: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((prevState: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

// Produtos iniciais para demonstração
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
];

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [products, setProducts] = useLocalStorage<Product[]>('shopProducts', initialProducts);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  const navigate = useNavigate();

  // Check authentication status on component mount
  useEffect(() => {
    const authStatus = localStorage.getItem('isAdminAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Simulação de autenticação simples
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Credenciais fixas para demonstração - em produção, use um sistema de autenticação seguro
    if (username === 'admin' && password === 'murela123') {
      setIsAuthenticated(true);
      localStorage.setItem('isAdminAuthenticated', 'true'); // Set auth flag
      setLoginError('');
    } else {
      setLoginError('Credenciais inválidas. Tente novamente.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAdminAuthenticated'); // Clear auth flag
    setUsername(''); // Clear username and password fields
    setPassword('');
    // navigate('/'); // Optionally navigate to home or login page after logout
  };

  // Função para adicionar um novo produto
  const addNewProduct = () => {
    const newProduct = {
      id: Date.now(), // Gera um ID único baseado no timestamp
      name: '',
      price: 0,
      image: '',
      imageUrl: '',
      description: '',
      sizes: [],
      colors: [],
      models: []
    };
    setEditingProduct(newProduct);
    setIsEditing(true);
  };

  // Função para editar um produto existente
  const editProduct = (product: Product) => {
    setEditingProduct({...product});
    setIsEditing(true);
  };

  // Função para confirmar exclusão de um produto
  const confirmDelete = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  // Função para excluir um produto
  const deleteProduct = () => {
    if (productToDelete) {
      const updatedProducts = products.filter(p => p.id !== productToDelete.id);
      setProducts(updatedProducts);
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    }
  };

  // Função para salvar as alterações de um produto
  const saveProduct = () => {
    if (!editingProduct || !editingProduct.name || typeof editingProduct.price !== 'number') {
      alert('Nome e preço são obrigatórios e o preço deve ser um número!');
      return;
    }

    // Certifique-se de que o ID existe para produtos existentes ou crie um novo para novos produtos
    const productToSave: Product = {
      ...editingProduct,
      id: editingProduct.id || Date.now(), // Garante que o ID exista
      image: editingProduct.image || '', // Garante que a imagem exista
      // Garante que imageUrl seja string ou undefined
      imageUrl: typeof editingProduct.imageUrl === 'string' ? editingProduct.imageUrl : undefined,
      // Garante que os arrays existam
      sizes: Array.isArray(editingProduct.sizes) ? editingProduct.sizes : [],
      colors: Array.isArray(editingProduct.colors) ? editingProduct.colors : [],
      models: Array.isArray(editingProduct.models) ? editingProduct.models : [],
    };

    if (!productToSave.name || !productToSave.price) {
      alert('Nome e preço são obrigatórios!');
      return;
    }

    let updatedProducts;
    const existingIndex = products.findIndex(p => p.id === productToSave.id);
    
    if (existingIndex >= 0) {
      // Atualiza um produto existente
      updatedProducts = [...products];
      updatedProducts[existingIndex] = productToSave;
    } else {
      // Adiciona um novo produto
      updatedProducts = [...products, productToSave];
    }
    
    setProducts(updatedProducts);
    setIsEditing(false);
    setEditingProduct(null);
  };

  // Função para lidar com mudanças nos campos do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditingProduct(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value
    }));
  };

  // Função para lidar com mudanças em arrays (tamanhos, cores, modelos)
  const handleArrayChange = (field: keyof Product, value: string) => {
    const values = value.split(',').map(item => item.trim()).filter(item => item);
    setEditingProduct(prev => ({
      ...prev,
      [field]: values
    }));
  };

  // Função para simular upload de imagem (em produção, use um serviço de armazenamento real)
  const handleImageChange = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Opções de imagens disponíveis no projeto
    const images = [poloUniformeImage, scrubUniformeImage, profissionaisImage];
    
    // Se o usuário inseriu uma URL externa, use-a
    if (editingProduct?.imageUrl && editingProduct.imageUrl.trim() !== '') {
      setEditingProduct(prev => prev ? {
        ...prev,
        image: prev.imageUrl || '' // Garante que imageUrl não seja undefined
      } : null);
      return;
    }
    
    // Caso contrário, alterne entre as imagens disponíveis
    if (editingProduct) {
      const currentIndex = images.indexOf(editingProduct.image);
      const nextIndex = (currentIndex + 1) % images.length;
      
      setEditingProduct(prev => prev ? {
        ...prev,
        image: images[nextIndex]
      } : null);
    }
  };

  // Função para lidar com a entrada de URL de imagem
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEditingProduct(prev => ({
      ...prev,
      imageUrl: value
    }));
  };

  // Função para visualizar a loja
  const viewStore = () => {
    navigate('/loja');
  };

  return (
    <div className="App bg-background text-foreground min-h-screen">
      {!isAuthenticated ? (
        // Tela de login
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-card p-8 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-center mb-6">
              <img src={logoImage} alt="Murela Brands Logo" className="h-16" />
            </div>
            <h1 className="text-2xl font-bold text-center mb-6">Área Administrativa</h1>
            
            {loginError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {loginError}
              </div>
            )}
            
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Usuário</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Senha</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              
              <button 
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center gap-2"
              >
                <Lock className="h-4 w-4" /> Entrar
              </button>
            </form>
            
            <div className="mt-4 text-center">
              <Link to="/" className="text-primary hover:text-primary/80 transition-colors text-sm">
                Voltar para o site
              </Link>
            </div>
          </div>
        </div>
      ) : (
        // Painel administrativo
        <div>
          <header className="navbar w-full bg-card shadow-md py-4 px-6">
            <div className="container mx-auto flex justify-between items-center">
              <div className="flex items-center gap-4">
                <img src={logoImage} alt="Murela Brands Logo" className="h-10" />
                <h1 className="text-xl font-bold">Painel Administrativo</h1>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={viewStore}
                  className="bg-secondary hover:bg-secondary/80 text-foreground py-2 px-4 rounded-md transition-colors flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" /> Ver Loja
                </button>
                <button 
                  onClick={handleLogout} // Use the new logout handler
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors flex items-center gap-2"
                >
                  <Lock className="h-4 w-4" /> Sair
                </button>
              </div>
            </div>
          </header>
          
          <main className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Gerenciar Produtos</h2>
              <button 
                onClick={addNewProduct}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-2 px-4 rounded-md transition duration-300 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Novo Produto
              </button>
            </div>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-md">
              <h3 className="text-blue-800 font-medium mb-2">Instruções de Uso</h3>
              <ul className="text-blue-700 text-sm list-disc pl-5 space-y-1">
                <li>Use este painel para gerenciar os produtos da loja virtual</li>
                <li>Adicione novos produtos clicando no botão "Novo Produto"</li>
                <li>Edite produtos existentes clicando no ícone de lápis</li>
                <li>Exclua produtos clicando no ícone de lixeira</li>
                <li>Para imagens, você pode alternar entre as disponíveis ou inserir uma URL externa</li>
                <li>Todas as alterações são salvas automaticamente e refletidas na loja</li>
                <li><strong>Credenciais de acesso:</strong> usuário: admin / senha: murela123</li>
              </ul>
            </div>
            
            {/* Lista de produtos */}
            <div className="bg-card rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="py-3 px-4 text-left">Imagem</th>
                    <th className="py-3 px-4 text-left">Nome</th>
                    <th className="py-3 px-4 text-left">Preço</th>
                    <th className="py-3 px-4 text-left">Descrição</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product: Product) => (
                    <tr key={product.id} className="border-t border-border">
                      <td className="py-3 px-4">
                        <div className="h-16 w-16 rounded-md overflow-hidden">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="h-full w-full object-cover" 
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">{product.name}</td>
                      <td className="py-3 px-4">R$ {product.price.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <div className="max-w-xs truncate">{product.description}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => editProduct(product)}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition-colors"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => confirmDelete(product)}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>
          
          {/* Modal de edição/adição de produto */}
          {isEditing && editingProduct && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-foreground">
                      {editingProduct.id ? 'Editar Produto' : 'Novo Produto'}
                    </h3>
                    <button 
                      onClick={() => {
                        setIsEditing(false);
                        setEditingProduct(null);
                      }} 
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Nome do Produto*</label>
                        <input 
                          type="text" 
                          name="name"
                          value={editingProduct.name || ''} 
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                          required
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Preço (R$)*</label>
                        <input 
                          type="number" 
                          name="price"
                          value={editingProduct.price || 0} 
                          onChange={handleInputChange}
                          step="0.01"
                          min="0"
                          className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                          required
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Descrição</label>
                        <textarea 
                          name="description"
                          value={editingProduct.description || ''} 
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Imagem do Produto</label>
                        <div className="flex items-center gap-4">
                          <div className="h-32 w-32 border border-input rounded-md overflow-hidden bg-muted flex items-center justify-center">
                            {editingProduct.image ? (
                              <img 
                                src={editingProduct.image} 
                                alt={editingProduct.name || "Preview"} 
                                className="h-full w-full object-cover" 
                              />
                            ) : editingProduct.imageUrl ? (
                              <img 
                                src={editingProduct.imageUrl} 
                                alt={editingProduct.name || "Preview"} 
                                className="h-full w-full object-cover" 
                              />
                            ) : (
                              <img 
                                src={editingProduct.image} 
                                alt="Preview" 
                                className="h-full w-full object-cover" 
                              />
                            ) : (
                              <span className="text-muted-foreground text-sm">Sem imagem</span>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <button 
                              type="button"
                              onClick={handleImageChange}
                              className="bg-secondary hover:bg-secondary/80 text-foreground py-2 px-4 rounded-md transition-colors flex items-center gap-2"
                            >
                              <Upload className="h-4 w-4" /> Trocar Imagem
                            </button>
                            
                            <div>
                              <label className="block text-sm font-medium mb-1">URL da Imagem (opcional)</label>
                              <input 
                                type="text" 
                                value={editingProduct.imageUrl || ''} 
                                onChange={handleImageUrlChange}
                                placeholder="https://exemplo.com/imagem.jpg"
                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Insira uma URL de imagem ou use o botão acima para alternar entre imagens disponíveis
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Tamanhos (separados por vírgula)</label>
                        <input 
                          type="text" 
                          value={editingProduct.sizes?.join(', ') || ''} 
                          onChange={(e) => handleArrayChange('sizes', e.target.value)}
                          placeholder="P, M, G, GG"
                          className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Cores (separadas por vírgula)</label>
                        <input 
                          type="text" 
                          value={editingProduct.colors?.join(', ') || ''} 
                          onChange={(e) => handleArrayChange('colors', e.target.value)}
                          placeholder="Azul, Preto, Branco"
                          className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Modelos (separados por vírgula)</label>
                        <input 
                          type="text" 
                          value={editingProduct.models?.join(', ') || ''} 
                          onChange={(e) => handleArrayChange('models', e.target.value)}
                          placeholder="Slim, Regular, Tradicional"
                          className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-4 mt-6">
                    <button 
                      onClick={() => {
                        setIsEditing(false);
                        setEditingProduct(null);
                      }}
                      className="px-4 py-2 border border-input rounded-md hover:bg-accent transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={saveProduct}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-2 px-4 rounded-md transition duration-300 flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" /> Salvar Produto
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Modal de confirmação de exclusão */}
          {showDeleteConfirm && productToDelete && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-background rounded-lg shadow-lg max-w-md w-full">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Confirmar Exclusão</h3>
                  <p className="mb-6">Tem certeza que deseja excluir o produto <strong>{productToDelete?.name}</strong>?</p>
                  
                  <div className="flex justify-end gap-4">
                    <button 
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setProductToDelete(null);
                      }}
                      className="px-4 py-2 border border-input rounded-md hover:bg-accent transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={deleteProduct}
                      className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" /> Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Admin;