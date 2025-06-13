// Serviço de API para integração com Gerencianet e Correios

// Tipos para Gerencianet
type PaymentMethod = 'credit_card' | 'pix' | 'boleto';

interface CreditCardData {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
  installments: string;
}

interface PaymentRequest {
  paymentMethod: PaymentMethod;
  total: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  customer: {
    name: string;
    email: string;
    cpf?: string;
    phone?: string;
    address: {
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      zipcode: string;
    };
  };
  creditCard?: CreditCardData;
}

interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  message?: string;
  pixCode?: string;
  boletoUrl?: string;
  boletoCode?: string;
}

// Tipos para Correios
interface ShippingRequest {
  cepOrigin: string;
  cepDestination: string;
  weight: number; // em kg
  length: number; // em cm
  height: number; // em cm
  width: number; // em cm
  diameter: number; // em cm
  format: 1 | 2 | 3; // 1 = caixa/pacote, 2 = rolo/prisma, 3 = envelope
}

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  days: number;
}

interface ShippingResponse {
  success: boolean;
  options?: ShippingOption[];
  message?: string;
}

// Simulação da API da Gerencianet
export const processPayment = async (request: PaymentRequest): Promise<PaymentResponse> => {
  // Simulação de processamento de pagamento
  return new Promise((resolve) => {
    // Simulando um tempo de processamento
    setTimeout(() => {
      // Abre a janela do EFI checkout
      const efiCheckoutUrl = 'https://checkout.efi.com.br/?' + new URLSearchParams({
        merchant_id: 'MURELA_MERCHANT',
        transaction_amount: request.total.toString(),
        currency: 'BRL',
        description: 'Compra Murela Brands',
        customer_name: request.customer.name,
        customer_email: request.customer.email,
        redirect_url: window.location.origin + '/checkout/success'
      }).toString();
      
      // Abre o checkout do EFI em uma nova janela
      window.open(efiCheckoutUrl, '_blank');
      
      // Simulando uma resposta de sucesso
      if (request.paymentMethod === 'credit_card') {
        resolve({
          success: true,
          transactionId: `GN-${Math.floor(Math.random() * 1000000)}`,
          message: 'Redirecionando para o checkout do EFI...'
        });
      } else if (request.paymentMethod === 'pix') {
        resolve({
          success: true,
          transactionId: `PIX-${Math.floor(Math.random() * 1000000)}`,
          pixCode: 'SIMULACAO_PIX_CODE_00001122334455667788',
          message: 'Redirecionando para o checkout do EFI...'
        });
      } else if (request.paymentMethod === 'boleto') {
        resolve({
          success: true,
          transactionId: `BOL-${Math.floor(Math.random() * 1000000)}`,
          boletoUrl: 'https://exemplo.com/boleto',
          boletoCode: '03399.63290 64000.000006 00125.201020 4 56140000017832',
          message: 'Redirecionando para o checkout do EFI...'
        });
      } else {
        resolve({
          success: false,
          message: 'Método de pagamento não suportado'
        });
      }
    }, 1500);
  });
};

// Simulação da API dos Correios
export const calculateShipping = async (request: ShippingRequest): Promise<ShippingResponse> => {
  // Simulação de cálculo de frete
  return new Promise((resolve) => {
    // Simulando um tempo de processamento
    setTimeout(() => {
      // Validação básica do CEP
      if (!request.cepDestination || request.cepDestination.length !== 8) {
        resolve({
          success: false,
          message: 'CEP de destino inválido'
        });
        return;
      }

      // Simulando opções de frete
      const options: ShippingOption[] = [
        {
          id: 'pac',
          name: 'PAC',
          price: 15.90 + (request.weight * 2), // Preço base + peso
          days: 7
        },
        {
          id: 'sedex',
          name: 'SEDEX',
          price: 25.50 + (request.weight * 3), // Preço base + peso
          days: 3
        },
        {
          id: 'express',
          name: 'Express',
          price: 35.90 + (request.weight * 4), // Preço base + peso
          days: 1
        }
      ];

      resolve({
        success: true,
        options
      });
    }, 1000);
  });
};

// Função para buscar endereço por CEP
export const fetchAddressByCEP = async (cep: string): Promise<any> => {
  // Simulação de busca de CEP
  return new Promise((resolve, reject) => {
    // Simulando um tempo de processamento
    setTimeout(() => {
      // Validação básica do CEP
      if (!cep || cep.length !== 8) {
        reject({
          success: false,
          message: 'CEP inválido'
        });
        return;
      }

      // Simulando endereços para diferentes CEPs
      const addresses: {[key: string]: any} = {
        '01001000': {
          street: 'Praça da Sé',
          neighborhood: 'Sé',
          city: 'São Paulo',
          state: 'SP'
        },
        '20010000': {
          street: 'Avenida Rio Branco',
          neighborhood: 'Centro',
          city: 'Rio de Janeiro',
          state: 'RJ'
        },
        '70070000': {
          street: 'Esplanada dos Ministérios',
          neighborhood: 'Zona Cívico-Administrativa',
          city: 'Brasília',
          state: 'DF'
        }
      };

      // Retorna o endereço se existir, ou um endereço genérico
      if (addresses[cep]) {
        resolve({
          success: true,
          address: addresses[cep]
        });
      } else {
        // Endereço genérico para simulação
        resolve({
          success: true,
          address: {
            street: 'Rua Exemplo',
            neighborhood: 'Bairro Teste',
            city: 'Cidade Exemplo',
            state: 'SP'
          }
        });
      }
    }, 800);
  });
};