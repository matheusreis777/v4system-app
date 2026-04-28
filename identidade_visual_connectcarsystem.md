# Identidade Visual ConnectCar System

Fonte analisada: [identidade_visual_connectcarsystem.html](C:/Users/mtrei/Downloads/identidade_visual_connectcarsystem.html)

## Paleta de cores

### Cores principais

| Nome | Hex | Papel |
| --- | --- | --- |
| Azul Marinho | `#061D3D` | Cor primária, autoridade e confiança |
| Laranja Connect | `#FF8000` | Cor de destaque, energia e ação |

### Cores de apoio

| Nome | Token CSS | Hex | Uso sugerido |
| --- | --- | --- | --- |
| Azul Médio | `--navy-mid` | `#0D2E5E` | Apoio ao azul principal, interfaces e variações |
| Azul Claro | `--navy-light` | `#1A4480` | Gradientes, fundos secundários e reforço visual |
| Laranja Escuro | `--orange-dark` | `#CC6600` | Hover, contraste e profundidade do destaque |
| Laranja Claro | `--orange-light` | `#FFB84D` | Realces leves e estados de apoio |

### Neutros

| Nome | Token CSS | Hex | Uso sugerido |
| --- | --- | --- | --- |
| Branco | `--white` | `#FFFFFF` | Fundo base e áreas limpas |
| Off White | `--off-white` | `#F5F6F8` | Fundo geral da interface |
| Cinza 100 | `--gray-100` | `#EDF0F4` | Bordas leves e divisões |
| Cinza 300 | `--gray-300` | `#BCC5D3` | Apoio visual e blocos neutros |
| Cinza 500 | `--gray-500` | `#7A8CA3` | Texto secundário e informações auxiliares |
| Cinza 700 | `--gray-700` | `#3D4F64` | Texto forte secundário |
| Preto Escuro | `--dark` | `#060606` | Fundos escuros e capas |

### Gradiente institucional

O guia usa um gradiente horizontal com esta composição:

`#061D3D` → `#1A4480` → `#CC6600` → `#FF8000`

CSS equivalente:

```css
background: linear-gradient(
  90deg,
  #061D3D 0%,
  #1A4480 35%,
  #CC6600 65%,
  #FF8000 100%
);
```

## Tipografia

### Famílias tipográficas

| Família | Origem | Uso principal |
| --- | --- | --- |
| `Barlow Condensed` | Google Fonts | Títulos, destaques, headlines e elementos de marca |
| `Barlow` | Google Fonts | Texto corrido, interface, labels e apoio |

Import usado no arquivo:

```html
<link href="https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=Barlow+Condensed:wght@600;700;800;900&display=swap" rel="stylesheet">
```

### Hierarquia tipográfica

| Estilo | Fonte | Peso | Tamanho | Observação |
| --- | --- | --- | --- | --- |
| H1 | `Barlow Condensed` | `900` | `56px` | Título principal |
| H2 | `Barlow Condensed` | `800` | `40px` | Título de seção |
| H3 | `Barlow Condensed` | `700` | `28px` | Subtítulo |
| H4 | `Barlow` | `700` | `20px` | Título de bloco |
| Body | `Barlow` | `400` | `16px` | Texto corrido com `line-height: 1.7` |
| Small | `Barlow` | padrão | `13px` | Informações auxiliares |
| Label | `Barlow` | `700` | `11px` | Caixa alta, `letter-spacing: 3px` |

### Direção visual da tipografia

- `Barlow Condensed` concentra a personalidade da marca: forte, técnica e direta.
- `Barlow` sustenta a legibilidade da interface e do conteúdo.
- Os labels usam caixa alta e espaçamento entre letras para reforçar organização e sistema.
- Os títulos usam azul marinho como cor dominante, com laranja para ênfase e chamadas.

## Resumo rápido

- Base institucional: azul marinho `#061D3D`
- Cor de ação: laranja `#FF8000`
- Fundo principal: off white `#F5F6F8`
- Títulos: `Barlow Condensed`
- Textos e UI: `Barlow`

