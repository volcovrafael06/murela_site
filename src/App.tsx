import './App.css';
import { useState, useEffect } from 'react';
import logoImage from '@/assets/logo/murela_logo_official.png'; // Use alias
// Import updated fabric image
import fabricImage from '@/assets/images/fabric_v2.png'; 
// Import updated portfolio images with symbol only
import poloUniformeImage from '@/assets/images/polo_uniforme_simbolo.png'; // Updated
import scrubUniformeImage from '@/assets/images/scrub_uniforme_final.png'; // Final image provided by user
import profissionaisImage from '@/assets/images/profissionais_uniformizados.png'; // Keep this one as it shows people
// Import new processo image
import processoCriativoImage from '@/assets/images/processo_criativo.png';

// Import icons
import { Palette, Users, Building, Phone, Mail, MapPin, Facebook, Instagram, Linkedin, X, Menu, CheckCircle, Send } from 'lucide-react';

function App() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: ''
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 50);
      
      const sections = ['home', 'diferenciais', 'tecnologia', 'portfolio', 'processo', 'contato'];
      let currentSection = 'home';
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) { 
            currentSection = section;
            break;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - (scrolled ? 80 : 100), 
        behavior: 'smooth'
      });
      setMobileMenuOpen(false);
    }
  };

  const openContactForm = () => setContactFormOpen(true);
  const closeContactForm = () => setContactFormOpen(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Formulário enviado:', formData);
    setFormStatus({ submitted: true, success: true, message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.' });
    setTimeout(() => {
      setFormStatus({ submitted: false, success: false, message: '' });
      setFormData({ name: '', email: '', phone: '', company: '', message: '' });
      setContactFormOpen(false);
    }, 5000);
  };

  const diferenciaisData = [
    { icon: Palette, title: 'Personalização Total', text: 'Cor, tecido, modelagem e bordado personalizados para atender às necessidades específicas da sua empresa.' }, 
    { icon: Users, title: 'Atendimento Consultivo', text: 'Equipe especializada oferecendo consultoria premium para garantir os melhores resultados para sua marca.' }, 
    { icon: Building, title: 'Para Todas as Empresas', text: 'Soluções adaptadas para pequenas, médias e grandes empresas, com flexibilidade para diferentes necessidades.' } 
  ];

  const processoData = [
    { title: 'Desenvolvimento Exclusivo', text: 'Layouts únicos para cada cliente.' }, 
    { title: 'Consultoria', text: 'Alinhamento de identidade visual.' }, 
    { title: 'Mockups e Amostras', text: 'Aprovação antes da produção.' } 
  ];

  // Updated Portfolio Data with final user image
  const portfolioData = [
    { src: profissionaisImage, alt: 'Profissionais Diversos Uniformizados Murela Brands', caption: 'Uniformes para Diversos Setores' },
    { src: poloUniformeImage, alt: 'Camisa Polo Azul Marinho com Símbolo Murela Brands', caption: 'Camisas Polo Personalizadas' }, 
    { src: scrubUniformeImage, alt: 'Scrub Hospitalar Verde com Símbolo Murela Brands (Imagem Final)', caption: 'Uniformes Hospitalares e Scrubs' }, // Updated alt text for final image
  ];

  return (
    <div className="App bg-background text-foreground">
      <header className={`navbar fixed w-full z-50 transition-all duration-300 ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="logo-container">
            <img src={logoImage} alt="Murela Brands Logo" className="logo-image" />
          </div>
          <nav className="hidden md:flex space-x-2">
            {[
              { id: 'home', label: 'Início' },
              { id: 'diferenciais', label: 'Diferenciais' },
              { id: 'tecnologia', label: 'Tecnologia' },
              { id: 'portfolio', label: 'Portfólio' },
              { id: 'processo', label: 'Processo' },
              { id: 'contato', label: 'Contato' },
            ].map((item) => (
              <a 
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => { e.preventDefault(); scrollToSection(item.id); }}
                className={`nav-link capitalize ${activeSection === item.id ? 'active' : ''}`}
              >
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
          <button 
            className="md:hidden text-foreground focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        <div className={`mobile-menu ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
           {[
              { id: 'home', label: 'Início' },
              { id: 'diferenciais', label: 'Diferenciais' },
              { id: 'tecnologia', label: 'Tecnologia' },
              { id: 'portfolio', label: 'Portfólio' },
              { id: 'processo', label: 'Processo' },
              { id: 'contato', label: 'Contato' },
            ].map((item) => (
              <a 
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => { e.preventDefault(); scrollToSection(item.id); }}
                className="mobile-menu-link"
              >
                {item.label}
              </a>
            ))}
        </div>
      </header>

      <section id="home" className="pt-32 pb-20 md:pt-40 md:pb-28 bg-secondary">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 animate-fadeIn">Uniformes Profissionais</h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-6 animate-fadeIn" style={{animationDelay: '0.2s'}}>Sua identidade em cada Detalhe!</h2>
            <p className="text-muted-foreground mb-8 text-lg animate-fadeIn" style={{animationDelay: '0.4s'}}>
              Somos referência em uniformes personalizados de alto padrão. Oferecemos estilo, funcionalidade e sofisticação em cada peça, elevando a imagem da sua empresa.
            </p>
            <button 
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 animate-fadeIn" 
              style={{animationDelay: '0.6s'}}
              onClick={openContactForm}
            >
              Entre em Contato
            </button>
          </div>
          <div className="md:w-1/2 animate-fadeIn" style={{animationDelay: '0.8s'}}>
            <div className="overflow-hidden rounded-lg shadow-lg">
              <img src={profissionaisImage} alt="Profissionais Uniformizados Murela Brands" className="hero-image transition-transform duration-500 hover:scale-105" />
            </div>
          </div>
        </div>
      </section>

      <section id="diferenciais" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-4">Diferenciais Murela Brands</h2>
          <div className="h-1 w-20 mx-auto bg-primary mb-12"></div> 
          <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-16 text-lg">
            Oferecemos personalização total em cor, tecido, modelagem e bordado. Nossa equipe especializada garante atendimento consultivo premium, com opções para empresas de todos os portes.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {diferenciaisData.map((item, index) => (
              <div key={index} className="bg-card p-8 rounded-lg shadow-md hover:shadow-lg transition duration-300 border-l-4 border-primary transform hover:-translate-y-1 flex flex-col">
                <div className="flex items-center mb-4">
                  <item.icon className="h-8 w-8 text-primary mr-4 flex-shrink-0" />
                  <h3 className="text-xl font-semibold text-card-foreground">{item.title}</h3>
                </div>
                <p className="text-muted-foreground flex-grow">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="tecnologia" className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <div className="overflow-hidden rounded-lg shadow-lg">
                <img src={fabricImage} alt="Tecido de Alta Performance Murela Brands" className="tech-image transition-transform duration-500 hover:scale-105" />
              </div>
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Tecnologia & Acabamento Profissional</h2>
              <div className="h-1 w-20 bg-primary mb-8"></div>
              <p className="text-muted-foreground mb-8 text-lg">
                Utilizamos tecidos de alta performance e durabilidade. Nossas técnicas incluem modelagem, corte, costura, estamparia e bordado digital, com rigoroso controle de qualidade em cada etapa.
              </p>
              <div className="mb-6 bg-card p-6 rounded-lg shadow-md transition duration-300 transform hover:-translate-y-1">
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Tecidos de Alta Performance</h3>
                <p className="text-muted-foreground">Materiais selecionados para garantir durabilidade, conforto e aparência impecável mesmo após múltiplas lavagens.</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-md transition duration-300 transform hover:-translate-y-1">
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Controle de Qualidade</h3>
                <p className="text-muted-foreground">Processo rigoroso em cada etapa da produção, garantindo uniformes de excelência que representam sua marca com distinção.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section with final user image */}
      <section id="portfolio" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-4">Portfólio</h2>
          <div className="h-1 w-20 mx-auto bg-primary mb-12"></div>
          <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-12 text-lg">
            Desenvolvemos uniformes para áreas administrativas, operacionais, hospitalares e estética, com diversos tipos de modelagens proporcionando conforto e resistência.
          </p>
          <div className="bg-secondary p-6 rounded-lg mb-12 border-l-4 border-primary shadow-md">
            <p className="text-foreground text-center font-medium">
              Camisas polos, Sociais, Camisetas, Jalecos, Scrubs, Pijamas cirúrgicos, Aventais, Uniformes Industriais e etc.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioData.map((item, index) => (
              <div key={index} className="bg-secondary rounded-lg shadow-md overflow-hidden transition duration-300 transform hover:-translate-y-1 hover:shadow-lg group relative">
                <img src={item.src} alt={item.alt} className="portfolio-image transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-center font-semibold text-sm">{item.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="processo" className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-4">Processo Criativo e Atendimento Customizado</h2>
          <div className="h-1 w-20 mx-auto bg-primary mb-12"></div>
          <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-16 text-lg">
            Desenvolvemos layouts exclusivos para cada cliente. Oferecemos consultoria de novos modelos, alinhando a identidade visual ao branding, com mockups e amostras físicas.
          </p>
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              {processoData.map((item, index) => (
                <div key={index} className="mb-8 flex items-start gap-4 transition duration-300 transform hover:scale-105">
                  <div className="flex-shrink-0 bg-primary text-primary-foreground rounded-full h-10 w-10 flex items-center justify-center font-bold text-lg">{index + 1}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-muted-foreground">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="md:w-1/2">
              <div className="overflow-hidden rounded-lg shadow-lg">
                <img src={processoCriativoImage} alt="Consultoria e Processo Criativo Murela Brands" className="tech-image transition-transform duration-500 hover:scale-105" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contato" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-4">Entre em Contato</h2>
          <div className="h-1 w-20 mx-auto bg-primary mb-12"></div>
          <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-16 text-lg">
            Estamos prontos para atender sua empresa e desenvolver uniformes que elevem sua marca. Entre em contato para um orçamento personalizado.
          </p>
          <div className="flex flex-col md:flex-row gap-12">
            <div className="md:w-1/2">
              <div className="bg-card p-8 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-card-foreground mb-4">Informações de Contato</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium">Telefone</p>
                      <p className="text-muted-foreground">(11) 9999-9999</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground">contato@murelabrands.com.br</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium">Endereço</p>
                      <p className="text-muted-foreground">São Paulo, SP - Brasil</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-card-foreground mb-3">Redes Sociais</h4>
                  <div className="flex gap-4">
                    <a href="#" className="text-primary hover:text-primary/80 transition-colors" aria-label="Facebook"><Facebook className="h-6 w-6" /></a>
                    <a href="#" className="text-primary hover:text-primary/80 transition-colors" aria-label="Instagram"><Instagram className="h-6 w-6" /></a>
                    <a href="#" className="text-primary hover:text-primary/80 transition-colors" aria-label="LinkedIn"><Linkedin className="h-6 w-6" /></a>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="bg-card p-8 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-card-foreground mb-4">Envie uma Mensagem</h3>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-card-foreground mb-1">Nome</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background" required />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-1">Email</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background" required />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="phone" className="block text-sm font-medium text-card-foreground mb-1">Telefone</label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="company" className="block text-sm font-medium text-card-foreground mb-1">Empresa</label>
                    <input type="text" id="company" name="company" value={formData.company} onChange={handleInputChange} className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background" />
                  </div>
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-sm font-medium text-card-foreground mb-1">Mensagem</label>
                    <textarea id="message" name="message" value={formData.message} onChange={handleInputChange} rows={4} className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background" required ></textarea>
                  </div>
                  <button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                    <Send className="h-4 w-4" /> Enviar Mensagem
                  </button>
                  {formStatus.submitted && (
                    <div className={`mt-4 p-3 rounded-md flex items-center gap-2 ${formStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {formStatus.success ? <CheckCircle className="h-5 w-5" /> : <X className="h-5 w-5" />}
                      {formStatus.message}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-foreground text-background py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 text-center md:text-left">
              <img src={logoImage} alt="Murela Brands Logo" className="h-16 w-auto mb-4 mx-auto md:mx-0" style={{ filter: 'brightness(0) invert(1)' }} />
              <p className="text-background/80">Uniformes profissionais de alta qualidade</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-background/80">&copy; {new Date().getFullYear()} Murela Brands. Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </footer>

      {contactFormOpen && (
        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-foreground">Entre em Contato</h3>
                <button onClick={closeContactForm} className="text-muted-foreground hover:text-foreground" aria-label="Fechar formulário">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="modal-name" className="block text-sm font-medium text-foreground mb-1">Nome</label>
                  <input type="text" id="modal-name" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background" required />
                </div>
                <div className="mb-4">
                  <label htmlFor="modal-email" className="block text-sm font-medium text-foreground mb-1">Email</label>
                  <input type="email" id="modal-email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background" required />
                </div>
                <div className="mb-4">
                  <label htmlFor="modal-phone" className="block text-sm font-medium text-foreground mb-1">Telefone</label>
                  <input type="tel" id="modal-phone" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background" />
                </div>
                <div className="mb-4">
                  <label htmlFor="modal-company" className="block text-sm font-medium text-foreground mb-1">Empresa</label>
                  <input type="text" id="modal-company" name="company" value={formData.company} onChange={handleInputChange} className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background" />
                </div>
                <div className="mb-6">
                  <label htmlFor="modal-message" className="block text-sm font-medium text-foreground mb-1">Mensagem</label>
                  <textarea id="modal-message" name="message" value={formData.message} onChange={handleInputChange} rows={4} className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background" required ></textarea>
                </div>
                <div className="flex justify-end gap-4">
                  <button type="button" onClick={closeContactForm} className="px-4 py-2 border border-input rounded-md hover:bg-accent transition-colors">Cancelar</button>
                  <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-2 px-4 rounded-md transition duration-300 flex items-center gap-2">
                     <Send className="h-4 w-4" /> Enviar
                  </button>
                </div>
                {formStatus.submitted && (
                  <div className={`mt-4 p-3 rounded-md flex items-center gap-2 ${formStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                     {formStatus.success ? <CheckCircle className="h-5 w-5" /> : <X className="h-5 w-5" />}
                    {formStatus.message}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

