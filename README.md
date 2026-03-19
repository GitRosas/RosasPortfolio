# Portefólio — João Miguel Santos Rosa

Portefólio pessoal construído com **HTML5**, **CSS3** e **JavaScript** puro, usando **Bootstrap 5**, **Font Awesome** e **Google Fonts**.

> **MBSE & Software Engineer (Space Systems)** — Coimbra, Portugal

---

## Estrutura de Pastas

```
/
├─ index.html            ← Home / Landing page
├─ projects.html         ← Lista de projetos (dinâmica via JSON)
├─ about.html            ← Sobre mim, experiência, competências
├─ contact.html          ← Formulário de contacto
├─ assets/
│  ├─ css/
│  │  └─ styles.css      ← Todo o CSS (variáveis, light/dark, responsivo)
│  ├─ js/
│  │  └─ main.js         ← Todo o JavaScript (tema, projetos, navegação)
│  ├─ img/
│  │  ├─ avatar.jpg      ← Foto de perfil (substituir pelo real)
│  │  └─ projects/       ← Imagens de projetos (substituir por reais)
│  └─ data/
│     └─ projects.json   ← Dados dos projetos (editável)
├─ favicon.ico           ← Favicon (substituir pelo real)
├─ README.md
└─ LICENSE               ← MIT
```

---

## Como Correr Localmente

> **Importante:** A página de projetos usa `fetch()` para carregar o JSON. Isso **não funciona** ao abrir `file://` diretamente no browser. É necessário um servidor local.

### Opção 1: Python (recomendado)

```bash
cd portfolio
python3 -m http.server 8000
# Abrir http://localhost:8000
```

### Opção 2: Node.js

```bash
npx serve .
# ou
npx http-server .
```

### Opção 3: VS Code Live Server

Instalar a extensão **Live Server** e clicar em "Go Live" no canto inferior direito.

---

## Como Editar Projetos

Editar o ficheiro `assets/data/projects.json`. Cada projeto tem esta estrutura:

```json
{
  "id": "identificador-unico",
  "title": "Nome do Projeto",
  "description": "Descrição breve do projeto.",
  "image": "assets/img/projects/nome-imagem.jpg",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "links": {
    "github": "https://github.com/GitRosas/repositorio",
    "demo": "https://url-da-demo.com"
  },
  "year": 2026
}
```

- **Adicionar projeto:** duplicar um objeto e alterar os campos.
- **Remover projeto:** apagar o objeto correspondente do array.
- **Imagens:** colocar em `assets/img/projects/` com nomes descritivos.
- **Tags:** os filtros na página de projetos são gerados automaticamente a partir das tags.

---

## Como Trocar Cores e Fontes

### Cores

Editar as variáveis CSS em `assets/css/styles.css` na secção `:root`:

```css
:root {
  --color-primary: #2563eb;      /* Cor principal */
  --color-primary-hover: #1d4ed8; /* Hover da cor principal */
  --bg-body: #f8fafc;            /* Fundo do body */
  --bg-card: #ffffff;            /* Fundo dos cards */
  /* ... */
}
```

As variáveis do modo escuro estão em `html.theme-dark { ... }`.

### Fontes

As fontes são carregadas via Google Fonts nos `<head>` dos HTML. Para trocar:

1. Ir a [fonts.google.com](https://fonts.google.com) e escolher novas fontes.
2. Substituir o `<link>` do Google Fonts em todos os ficheiros HTML.
3. Atualizar no CSS:
   - `font-family: 'Inter', sans-serif;` → para texto
   - `font-family: 'Space Grotesk', sans-serif;` → para títulos

---

## Configurar Formulário de Contacto

### Opção A: Formspree (recomendado)

1. Criar conta em [formspree.io](https://formspree.io).
2. Criar um novo formulário e copiar o ID (ex.: `xyzabc12`).
3. Em `contact.html`, substituir:
   ```html
   action="https://formspree.io/f/YOUR_FORM_ID"
   ```
   por:
   ```html
   action="https://formspree.io/f/xyzabc12"
   ```

### Opção B: Netlify Forms

1. Fazer deploy no [Netlify](https://netlify.com).
2. Em `contact.html`, adicionar `data-netlify="true"` ao `<form>`:
   ```html
   <form id="contact-form" class="contact-form" method="POST" data-netlify="true" novalidate>
   ```
3. Remover o atributo `action`.
4. O Netlify deteta o formulário automaticamente no build.

---

## Publicar no GitHub Pages

1. Criar repositório no GitHub (ex.: `GitRosas.github.io` para site pessoal, ou qualquer nome).
2. Push dos ficheiros:
   ```bash
   git init
   git add .
   git commit -m "Portefólio inicial"
   git branch -M main
   git remote add origin https://github.com/GitRosas/GitRosas.github.io.git
   git push -u origin main
   ```
3. Em **Settings → Pages**, selecionar a branch `main` e a pasta `/` (root).
4. O site ficará disponível em `https://gitrosas.github.io/`.

### Domínio personalizado (opcional)

1. Em **Settings → Pages → Custom domain**, inserir o domínio (ex.: `joaorosa.dev`).
2. Configurar registos DNS:
   - **CNAME** → `gitrosas.github.io`
   - Ou registos **A** para os IPs do GitHub Pages.
3. Ativar **Enforce HTTPS**.
4. Criar ficheiro `CNAME` na raiz do repositório com o domínio.

---

## Nota Sobre `file://` vs `http://`

A página `projects.html` usa `fetch()` para carregar dados de `assets/data/projects.json`. Os browsers bloqueiam pedidos `fetch()` a ficheiros locais por razões de segurança (CORS). Por isso:

- **`file://`** → a página de projetos e os projetos em destaque na home **não carregam**.
- **`http://localhost`** → tudo funciona corretamente.

As restantes páginas (Sobre, Contacto) funcionam normalmente em `file://`.

---

## Próximos Passos

- [ ] **Substituir placeholders** — avatar (`assets/img/avatar.jpg`), imagens de projetos, email, LinkedIn, dados de experiência/formação.
- [ ] **Adicionar favicon real** — substituir `favicon.ico` por um ícone personalizado (usar [favicon.io](https://favicon.io)).
- [ ] **Adicionar mais projetos** — editar `assets/data/projects.json`.
- [ ] **Ativar formulário** — configurar Formspree ou Netlify Forms (ver secção acima).
- [ ] **Personalizar paleta** — ajustar variáveis CSS no `:root` do `styles.css`.
- [ ] **Google Analytics / Plausible** — adicionar script de analytics no `<head>` de cada página.
- [ ] **PWA (opcional)** — adicionar `manifest.json` e service worker para instalar como app.
- [ ] **CI/CD** — configurar GitHub Actions para validar HTML (htmlhint), CSS (stylelint) e acessibilidade (pa11y) em cada push.
- [ ] **Internacionalização** — adicionar toggle pt-PT / en para versão bilingue.
- [ ] **Blog (opcional)** — secção de artigos com Markdown → HTML via build script.

---

## Licença

MIT — ver [LICENSE](LICENSE).
