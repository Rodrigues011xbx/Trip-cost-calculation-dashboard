# ⛪ Sistema de Reembolso de Viagens — Igreja Maceió

> Controle de reembolso de quilometragem para o **Ministério Extralocal** da Igreja de Maceió.  
> Registre viagens, calcule reembolsos automaticamente e gere relatórios por condutor.

---

## 📋 Sobre o Projeto

Este sistema foi desenvolvido para facilitar o controle financeiro das viagens realizadas pelos irmãos do Ministério Extralocal (Vinícius, Henrique e outros), que viajam para dar apoio às congregações de **Arapiraca**, **Marechal Deodoro** e demais localidades.

O cálculo do valor de reembolso é baseado em critérios técnicos utilizados por especialistas em gestão de frotas, considerando não apenas o combustível, mas o **custo real** de utilização do veículo.

---

## ✨ Funcionalidades

### 🏠 Dashboard
- Visão geral com total de viagens, KM rodado, valor a reembolsar e condutores ativos
- **Gráfico de barras** — Reembolso por condutor
- **Gráfico de linha** — KM rodado por mês
- **Gráfico de rosca** — Proporção de viagens por condutor
- Ranking de condutores e histórico das últimas viagens

### 🚗 Registrar Viagem
- Campos: Condutor, Data, Origem, Destino, KM Inicial, KM Final e Motivo
- **Pré-visualização automática** do reembolso conforme você preenche os quilômetros
- Lista de viagens com filtro por condutor
- Editar e excluir viagens registradas

### 📄 Relatório
- Filtros por **condutor**, **mês** e **ano**
- Detalhamento completo de cada viagem (datas, trechos, KMs, motivo, valor)
- Subtotal por condutor + **total geral**
- Botão de **impressão** (imprime apenas o relatório)

### ⚙️ Configurações
- Configuração individualizada de cada componente de custo por km
- Cálculo automático do custo total ao alterar qualquer valor
- Gerenciamento de condutores (adicionar / remover)
- Botão para restaurar os valores padrão

---

## 💰 Cálculo do Custo por Quilômetro

O valor de reembolso é calculado somando os 5 componentes abaixo:

| Componente | Cálculo | Valor Padrão |
|---|---|---|
| ⛽ Combustível | Preço do litro ÷ consumo médio (km/l) | R$ 0,67/km |
| 🛢️ Troca de Óleo | R$ 350,00 ÷ 10.000 km | R$ 0,04/km |
| 🔵 Pneus | R$ 1.600,00 ÷ 40.000 km | R$ 0,04/km |
| 🔧 Manutenção Geral | Estimativa fixa | R$ 0,10/km |
| 🚿 Lavagem | R$ 50,00 ÷ 1.000 km | R$ 0,05/km |
| | **Total** | **R$ 0,90/km** |

> Os valores podem ser ajustados a qualquer momento na aba **Configurações**.

---

## 🗂️ Estrutura de Arquivos

```
custo-viagem/
├── index.html                        # Estrutura HTML da aplicação
├── style.css                         # Estilos (tema light premium)
├── app.js                            # Lógica da aplicação
├── readme.md                         # Este arquivo
└── explicação-calculo-de-custos.md   # Documentação técnica do cálculo
```

---

## 🚀 Como Usar

1. Abra o arquivo `index.html` diretamente no navegador (Google Chrome ou Firefox recomendados)
2. **Não precisa de servidor**, instalação ou internet — funciona 100% offline
3. Os dados são salvos automaticamente no **localStorage** do navegador

> ⚠️ Os dados ficam armazenados no navegador do computador utilizado. Limpar os dados do navegador irá apagar os registros.

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Uso |
|---|---|
| **HTML5** | Estrutura da aplicação |
| **CSS3** | Estilos, animações e tema light |
| **JavaScript (Vanilla)** | Toda a lógica de negócio |
| **Chart.js 4** | Gráficos do dashboard |
| **Font Awesome 6** | Ícones |
| **Google Fonts (Inter)** | Tipografia |

---

## 📐 Interface

- **Tema:** Light (claro) com paleta em índigo/azul
- **Sidebar recolhível:** Clique no botão `☰` para expandir/recolher o menu lateral com animação suave
- **Responsivo:** Funciona em telas de desktop, notebook e tablet
- **Impressão:** O relatório é otimizado para impressão em papel A4

---

## 👤 Condutores Padrão

Os seguintes condutores já estão cadastrados por padrão:

- **Vinícius** — Viagens de apoio à congregação de Arapiraca
- **Henrique** — Ministério Extralocal

Novos condutores podem ser adicionados na aba **Configurações → Gerenciar Condutores**.

---

## 📝 Licença

Uso interno — Igreja de Maceió · Ministério Extralocal · 2026
