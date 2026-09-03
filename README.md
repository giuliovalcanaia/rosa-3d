# Rosa 3D

Uma página web interativa e romântica que exibe uma rosa tridimensional paramétrica. Inclui animação de abrir e fechar pétalas, contador de tempo de namoro e contador regressivo para o próximo mês-versário.

## Funcionalidades

- **Rosa 3D Paramétrica**: gerada matematicamente com a fórmula de Paul Nylander usando Three.js
- **Animação de Abrir/Fechar**: clique na tela para ver a rosa abrir ou fechar suas pétalas com transição suave
- **Contador de Relacionamento**: exibe o tempo de namoro em anos, meses e dias, atualizado dinamicamente no título da página
- **Contador Regressivo**: mostra quantos dias faltam para o próximo mês-versário ou aniversário
- **Interatividade**: rotacione a câmera arrastando com o mouse (ou toque)
- **Responsivo**: adaptado para desktop e dispositivos móveis

## Demonstração

O projeto está configurado para rodar no GitHub Pages. Acesse o repositório publicado para visualizar.

## Tecnologias

- HTML5
- CSS3
- JavaScript (Vanilla)
- [Three.js](https://threejs.org/) r128 (via CDN)

## Como executar localmente

Como o projeto é um único arquivo HTML estático, basta abrir o `index.html` diretamente no navegador:

```bash
# Navegue até a pasta do projeto e abra o arquivo
# Ou utilize um servidor local simples:
npx serve .
# ou
python3 -m http.server 8000
```

## Personalização

### Alterar a data de início do namoro

Para adaptar o projeto ao seu relacionamento, edite a constante global no arquivo `index.html`:

**Linha ~93**:

```javascript
const DATA_INICIO = new Date(2025, 8, 7); // 7 de setembro de 2025
```

> **Importante:** no JavaScript, o mês é *zero-indexed* (janeiro = 0, fevereiro = 1, ..., setembro = 8).

Altere essa linha para a data desejada, mantendo o formato `new Date(ano, mes, dia)`. Tanto o contador de tempo de namoro quanto o contador regressivo usarão automaticamente essa mesma constante.

## Estrutura do projeto

```
rosa-3d/
└── index.html
```

## Referências

- [Paul Nylander — Rose-Shaped Parametric Surface](https://nylander.wordpress.com/2006/06/21/rose-shaped-parametric-surface/) — artigo original com a fórmula matemática utilizada para gerar a rosa 3D.

