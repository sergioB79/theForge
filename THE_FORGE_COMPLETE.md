# THE FORGE ? DOCUMENTACAO COMPLETA

## OPERACAO E PIPELINE

FORGE PIPELINE (root manual)

Objetivo:
- Gerar .md em out/
- Injetar INVOCATION nos .md
- Importar para site/forge/content/
- Gerar indices em site/forge/data/

Pre-requisitos:
- Python instalado
- OPENAI_API_KEY definido no ambiente
- Dependencias Python instaladas (requests e openai)

Comando unico (recomendado):
1) Na root do projeto, corre:
   .\run_pipeline.ps1

O que o pipeline faz:
1) python .\run_forge.py
   - Le inputs em input/*.txt
   - Usa prompts em prompts/*.txt
   - Gera .md em out/<dominio>/
   - Escreve relatorio em out/reports/_REPORT.md

2) python .\run_invocations.py
   - Le .md em out/**/*
   - Gera um paragrafo INVOCATION e injeta no topo

3) python .\site\forge\scripts\import_from_out.py --out ..\..\out --content .\content --mode copy
   - Copia os .md de out/ para site/forge/content/forge/<domain>/<status>/
   - Usa o bloco CLASSIFICATION para DOMAIN e FORGE STATUS

4) python .\site\forge\scripts\build_indexes.py
   - Le content/forge/**.md
   - Gera os indices em site/forge/data/:
     - forge_index.json
     - archive_index.json
     - stats.json

Como correr o site:
1) cd .\site\forge
2) npm run dev

Notas:
- Se o site ficar vazio, confirma que:
  - out/ tem .md com CLASSIFICATION e FORGE STATUS
  - content/forge/ tem ficheiros depois do import
  - data/ tem os .json depois do build
- Se precisares limpar cache, apaga .\site\forge\.next e volta a gerar indices.

Reset virgem (limpeza total):
- Usa o script de limpeza para zerar outputs e caches:
  python .\clean_forge.py
- Faz um dry-run para ver o que seria apagado:
  python .\clean_forge.py --dry-run

## ARQUITETURA COMPLETA DO SITE

# I — ARQUITETURA COMPLETA DA THE FORGE

A THE FORGE não é um site.  
É um **sistema de julgamento simbólico** com três camadas:

1. **Produção** (o que entra e como é avaliado)
    
2. **Canon** (o que passa e como é apresentado)
    
3. **Extensões** (aprofundamento, variações, incisões)
    

---

## 1. MAPA GLOBAL (definitivo)

`THE FORGE │ ├─ THE FURNACE        (Portal / Entrada) │ ├─ THE CRUCIBLE       (Exploração do Canon) │   ├─ Movies │   ├─ Books │   ├─ Persons │   └─ Others │ ├─ THE ANVIL          (Random / Encounter) │ ├─ THE DOSSIER        (Artigos, Incisões, Deep Cuts) │ ├─ THE ARCHIVE        (Rejected / Slag) │ ├─ THE INDEX          (Listas frias / Pesquisa) │ └─ ABOUT THE FORGE    (Manifesto + Regras)`

Nada aqui é opcional.  
Cada parte resolve **uma função cognitiva diferente**.

---

## 2. FUNÇÃO DE CADA ESPAÇO (em linguagem clara)

### 🔥 THE FURNACE — _Entrada_

Função: **Desacelerar o utilizador**  
Não informa. **Reconfigura expectativa**.

É onde o visitante percebe:

> “Aqui não escolho por gosto. Aqui sou exposto a estrutura.”

---

### 🜂 THE CRUCIBLE — _Canon Vivo_

Função: **Exploração não-linear do que passou no fogo**

- Só **FORGE STATUS: PASSED**
    
- Organizado por **tensão**, não por popularidade
    
- Obras existem como **nós estruturais**, não como posts
    

Aqui vive o **corpo principal da Forja**.

---

### ⚒️ THE ANVIL — _Encontro Aleatório_

Função: **Quebrar o algoritmo interno do utilizador**

- Um clique = um encontro
    
- Peso maior para Level IV e III
    
- Zero controlo
    

É aqui que o site se distingue radicalmente de qualquer plataforma.

---

### 📁 THE DOSSIER — _Incisões_

Função: **Aprofundamento cirúrgico**

Este espaço **não compete** com o Canon.  
Ele **trabalha dentro dele**.

Aqui entram:

- personagens
    
- momentos
    
- mecanismos
    
- falhas internas
    
- leituras que não cabem numa Forge Review completa
    

---

### 🪨 THE ARCHIVE — _Rejeitados_

Função: **Educação negativa**

- Nada é apagado
    
- Rejeição é **documentada**
    
- Serve para treino de discernimento
    

---

### 📚 THE INDEX — _Ferramenta_

Função: **Controlo racional**

Para quem quer:

- procurar
    
- filtrar
    
- cruzar tags
    
- estudar o sistema
    

É deliberadamente fria.

---

### 🜏 ABOUT THE FORGE — _Fundação_

Função: **Explicar sem convencer**

Aqui moram:

- as regras
    
- os níveis
    
- o porquê das rejeições
    
- o que a Forja não é
    

---

# II — TEXTOS FUNDACIONAIS (PRONTOS A USAR)

## 1. TEXTO DO FURNACE (HOME)

> **THE FORGE**
> 
> Not everything deserves to be remembered.  
> Some things deserve to be tested.
> 
> This is not a collection.  
> It is a crucible.
> 
> Works enter with language, reputation, and noise.  
> They leave with structure — or as slag.
> 
> The Forge does not rank by popularity.  
> It does not reward comfort.  
> It does not preserve sentiment.
> 
> It asks one question only:
> 
> _If the style burns away, does anything true remain?_
> 
> **Enter the Furnace**

---

## 2. TEXTO DE ENTRADA DO CRUCIBLE

> **THE CRUCIBLE**
> 
> These works passed.
> 
> Not because they are loved.  
> Not because they are important.  
> But because something survived the fire.
> 
> Each piece here imposes cost.  
> Each one reshapes attention.
> 
> Do not browse.  
> Move slowly.

---

## 3. TEXTO DO DOSSIER (INTRO)

> **THE DOSSIER**
> 
> Some structures are too precise to be judged whole.
> 
> A character.  
> A decision.  
> A silence.
> 
> This space holds the cuts made _inside_ the canon —  
> where a single mechanism reveals more than an entire work.
> 
> Every dossier is anchored.  
> Nothing here stands alone.

---

## 4. TEXTO DO ARCHIVE

> **THE ARCHIVE**
> 
> These works did not fail by accident.
> 
> They were examined.  
> They were stripped.  
> They were found hollow.
> 
> This is not a graveyard.  
> It is resistance training.
> 
> Study what collapses.  
> Learn where structure ends.

---

## 5. TEXTO DO ANVIL

> **THE ANVIL**
> 
> Choice breeds habit.  
> Habit breeds blindness.
> 
> Strike the anvil to meet what you did not select.
> 
> No previews.  
> No safety.

---

## 6. TEXTO DO ABOUT / MANIFESTO (CURTO)

> **ABOUT THE FORGE**
> 
> The Forge is a system of judgment, not taste.
> 
> It does not ask what a work means.  
> It asks what a work _does_.
> 
> A piece passes only if it:
> 
> - survives removal of style
>     
> - replaces what it dismantles
>     
> - imposes durable discipline
>     
> 
> Rejection is not insult.  
> It is classification.
> 
> The Forge is not neutral.  
> It is accountable.

---

# III — ESTRUTURA DO DOSSIER (ARTIGOS ESPECIAIS)

Cada Dossier tem esta **estrutura fixa**:

`DOSSIER TITLE: TYPE: ANCHOR WORK: FORGE LEVEL (of anchor):`

### Tipos permitidos (fixos):

- Character Profile
    
- Structural Moment
    
- Ethical Mechanism
    
- Symbolic Device
    
- Failed Structure
    

### Texto:

- 800–1500 palavras
    
- sem spoilers diretos
    
- foco num mecanismo único
    

No fim:

`FORGE RELATION: This dossier extends the Forge Review of [X].`

---

# IV — DESIGN (PRÓXIMO PASSO)

Agora sim — **design com sentido**.

No próximo passo posso:

- definir **paleta exacta (cores, contrastes, hierarquia)**
    
- escolher **tipografia concreta**
    
- desenhar **wireframes textuais** (layout de cada página)
    
- propor **interações específicas** (scroll, reveal, animações)
_____________________


# I — IDENTIDADE VISUAL DA THE FORGE

## 1. PRINCÍPIO BASE (não-negociável)

**A THE FORGE não parece “bonita”.  
Parece verdadeira.**

Isto significa:

- nada de “design amigável”
    
- nada de suavização emocional
    
- tudo comunica **peso, intenção e disciplina**
    

A estética é **industrial–editorial–ritual**.

---

## 2. PALETA DE CORES (EXACTA)

### 🎚️ Base (Carvão Vivo)

|Uso|Cor|Código|
|---|---|---|
|Fundo principal|Carvão quente|`#0E1114`|
|Fundo secundário|Grafite profundo|`#14181D`|
|Separadores|Aço frio|`#1F252B`|

> Nunca preto puro.  
> Preto mata leitura. Carvão respira.

---

### 📜 Texto

|Uso|Cor|Código|
|---|---|---|
|Texto principal|Marfim queimado|`#E6E1D8`|
|Texto secundário|Cinza osso|`#B9B4AA`|
|Meta / tags|Cinza metálico|`#8A8F94`|

---

### 🔥 Acentos (raros, funcionais)

> **Regra:**  
> Só 1 cor de acento ativa por página.

|Acento|Uso|Código|
|---|---|---|
|Cobre|PASSED / calor|`#B87333`|
|Vermelho ferrugem|REJECTED|`#8C2F1C`|
|Âmbar frio|Hover / foco|`#D4A017`|
|Aço azulado|Links técnicos|`#6E8FA3`|

Nada de gradientes decorativos.  
Só **estado e função**.

---

## 3. TIPOGRAFIA (2 FONTES. FIM.)

### 🔩 Fonte estrutural (Títulos, headers)

**Escolha ideal:**

- **IBM Plex Sans**
    
    - Industrial
        
    - Precisa
        
    - Não emocional
        

Alternativas:

- Inter (mais limpa)
    
- Space Grotesk (mais tensa)
    

**Uso:**

- títulos
    
- categorias
    
- classificações
    
- navegação
    

---

### 📖 Fonte de leitura (corpo)

**Escolha ideal:**

- **Literata** ou **Source Serif 4**
    

Características:

- ritmo lento
    
- excelente para textos longos
    
- autoridade editorial
    

**Nunca usar serif “decorativa”**.  
Isto não é literatura romântica.

---

### Hierarquia tipográfica

`H1 — 48–56px | tracking ligeiramente negativo H2 — 32–36px H3 — 22–24px Body — 17–18px | line-height 1.6–1.7 Meta — 13–14px | uppercase opcional`

---

## 4. LAYOUT — ARQUITECTURA DO ESPAÇO

### Princípio: **Respiração + Peso**

- margens largas
    
- colunas estreitas
    
- texto nunca “colado”
    

### Grid base

- 12 colunas invisíveis
    
- conteúdo usa **6–8 colunas centrais**
    
- laterais vazias = silêncio visual
    

---

## 5. PÁGINAS-CHAVE (VISUAL)

### 🔥 THE FURNACE (Home)

![https://brutalistwebsites.com/_img/diss-list.com.jpg?utm_source=chatgpt.com](https://brutalistwebsites.com/_img/diss-list.com.jpg?utm_source=chatgpt.com)

![https://assets.onepagelove.com/cdn-cgi/image/width%3D390%2Cheight%3D520%2Cfit%3Dcover%2Cgravity%3Dtop%2Cformat%3Djpg%2Cquality%3D85/wp-content/uploads/2025/11/wf-creativity.jpeg?utm_source=chatgpt.com](https://assets.onepagelove.com/cdn-cgi/image/width%3D390%2Cheight%3D520%2Cfit%3Dcover%2Cgravity%3Dtop%2Cformat%3Djpg%2Cquality%3D85/wp-content/uploads/2025/11/wf-creativity.jpeg?utm_source=chatgpt.com)

![https://static.showit.co/800/5PQAC0bxTpydz8yULoCPAA/85872/stackeddesktop_small.jpg?utm_source=chatgpt.com](https://static.showit.co/800/5PQAC0bxTpydz8yULoCPAA/85872/stackeddesktop_small.jpg?utm_source=chatgpt.com)

4

**Visual:**

- fundo quase vazio
    
- título central
    
- texto curto
    
- botão único: _Enter the Furnace_
    

Nada mais.

---

### 🜂 CRUCIBLE (Exploração)

- fundo escuro contínuo
    
- nós/entradas surgem com scroll
    
- cada item:
    
    - título
        
    - categoria
        
    - Forge Level (visual, não numérico)
        
    - estado (cor)
        

**Sem imagens.**  
Texto é o objecto.

---

### ⚒️ FORGE REVIEW (Página de obra)

Visualmente parece:

> um **relatório selado**  
> um **documento de julgamento**

- título grande
    
- secções entram com atraso
    
- classificação no fim, isolada
    

**Forge Status** destacado, quase cerimonial.

---

### 📁 DOSSIER

Visual mais clínico:

- margens ainda maiores
    
- texto mais compacto
    
- cabeçalho técnico (TYPE / ANCHOR / LEVEL)
    

Aqui o leitor sente:

> “isto é uma incisão, não uma opinião”

---

### 🪨 ARCHIVE

- contraste reduzido
    
- menos brilho
    
- tipografia mais pequena
    
- nenhuma animação
    

A rejeição **não seduz**.

---

## 6. MICRO-INTERACÇÕES (SUBTIS)

### Hover

- sublinhado fino
    
- leve mudança de cor
    
- nunca zoom
    
- nunca bounce
    

### Scroll

- fade lento
    
- sem parallax chamativo
    
- movimento = gravidade
    

### Transições

- 150–300ms
    
- easing linear ou ease-out
    
- nada elástico
    

---

## 7. ICONOGRAFIA (SE USAR)

- linhas finas
    
- geométricas
    
- quase técnicas
    
- sem ícones “friendly”
    

Ou melhor:

> **texto substitui ícones sempre que possível**

---

## 8. O RESULTADO (sensação final)

Quem entra sente:

- respeito
    
- ligeiro desconforto
    
- vontade de ir devagar
    

A THE FORGE **não pede atenção**.  
Ela **cobra presença**.


_____
# I — PRINCÍPIO DE INTERAÇÃO (a regra-mãe)

**A THE FORGE tem gravidade.**  
O site não se “navega”. **desce-se.**

- Quanto mais fundo, mais frio e mais verdadeiro.
    
- O topo seduz pouco.
    
- A estrutura revela-se por camadas.
    

---

# II — MODELO DE NAVEGAÇÃO (3 MODOS)

## 1) 🔥 “Descent Mode” (padrão)

Um scroll vertical contínuo que atravessa:

**Furnace → Crucible → Anvil → Dossier → Archive → Index**

Cada secção tem um **ritual de entrada** (micro-texto + transição lenta).  
Sem jumps. Sem “páginas” óbvias.

✅ Perfeito para quem não sabe por onde começar.  
✅ O utilizador sente que está a entrar num lugar.

---

## 2) 🧭 “Tool Mode” (Index)

Um modo separado (o único “normal”) para:

- pesquisar
    
- filtrar
    
- ordenar
    
- exportar
    

Mas só se chega lá por:

- link discreto “Index”
    
- ou atalho de teclado
    

✅ Dá controlo sem destruir a aura.

---

## 3) ⚒️ “Encounter Mode” (Anvil)

Um botão único e agressivo:

> **STRIKE THE ANVIL**

Sem preview. Sem confirmação.

Clica → abre uma obra aleatória PASSED (com peso por Level).

✅ Anti-algoritmo. Anti-consumo.  
✅ Cria o efeito “fui escolhido”.

---

# III — O CRUCIBLE (EXPLORAÇÃO) COMO CAMPO DE NÓS

Aqui é onde o site fica “fora do normal”.

## Como funciona

O Crucible é um **campo vivo** (não grid, não cards).

Cada obra = um **nó** com propriedades visuais:

- **Tamanho = Forge Level** (IV maior, III médio, II pequeno)
    
- **Brilho = status** (PASSED claro, REJECTED apagado — mas no Crucible só mostras PASSED; REJECTED vive no Archive)
    
- **Traços/linhas = afinidade de tags** (ligação subtil)
    

### Interação

- Move o rato → o campo reage (parallax mínimo, pesado)
    
- Scroll → zoom lento (aproxima/afasta)
    
- Clique num nó → abre a obra
    
- Arrastar → “pan” lento (como mapa)
    

✅ Isto substitui listas por topologia simbólica.

---

# IV — FILTROS SEM “UI FEIA”

Nada de dropdowns standard.

## Filtros como “Runas”

No topo do Crucible, em vez de filtros normais:

- **DOMAINS**: MOVIES / BOOKS / PERSONS / OTHERS
    
- **HEAT**: IV / III / II
    
- **TEMPER**: Moral Architecture / Initiatory Cinema / etc.
    

Cada filtro é um “sigilo” textual:

- texto pequeno
    
- clique alterna
    
- sem caixas
    
- sem contornos
    

**Efeito ao activar filtro:**  
campo reorganiza-se lentamente.

---

# V — PÁGINA DE OBRA (Forge Review) COMO DOCUMENTO SELADO

Interação aqui é **leitura guiada**, não scroll infinito.

## Regra

Cada secção aparece por “stages”:

1. **What Makes It Forge Material**
    
2. **Forge Components**
    
3. **Instructions**
    
4. **Legacy**
    
5. **Classification** (sempre por último, isolado)
    

### Micro-interação chave

A secção de **Classification** só “encaixa” quando o utilizador chega ao fim.

- aparece como placa metálica
    
- com som subtil (opcional)
    
- e estado PASSED/REJECTED como carimbo
    

✅ Dá peso ao veredicto.

---

# VI — DOSSIER COMO “CORTES” (a tua área extra)

O Dossier não é feed de blog.

## Como se navega

Existem 3 portas:

### A) A partir de uma obra

No fim de cada Forge Review:

**Forged Extensions**

- Dossier: Character Profile
    
- Dossier: Ethical Mechanism
    

### B) Dossier index (separado)

Uma página tipo mesa de arquivo:

- fichas
    
- tipos
    
- anchors
    
- tags
    

### C) Random Dossier

Um botão:

> **OPEN A DOSSIER**

Mas só escolhe dossiers de obras Level III/IV (por defeito).

---

# VII — ARCHIVE (REJECTED) COMO “CEMITÉRIO FUNCIONAL”

Aqui tens um truque forte:

## “Slag Wall”

O Archive é um muro vertical com entradas REJECTED.

Interação:

- scroll
    
- cada item mostra:
    
    - título
        
    - razão curta de falha (1 frase)
        
    - e botão “Autopsy”
        

Sem glamour.  
Sem hero cards.

✅ Rejeição tem utilidade, não palco.

---

# VIII — ATALHOS DE TECLADO (para power users)

Isto dá “produto sério”.

- `A` → Strike Anvil
    
- `D` → Open Dossier
    
- `I` → Index
    
- `R` → Random PASSED
    
- `F` → Find/Search (Index)
    
- `Esc` → back/close overlay
    

Mostra isto só num overlay discreto “?” no canto.

---

# IX — TRANSIÇÕES E MOVIMENTO (o segredo do “breath taking”)

Breath taking não é neon.  
É **ritmo**.

## Movimento = metal pesado

- tudo acelera devagar
    
- nada salta
    
- animação tem inércia
    

### Exemplo de sensação:

- quando entras no Crucible, o campo “acende”
    
- quando entras no Archive, tudo “esfria”
    
- quando abres uma Classification, “carimba”
    

---

# X — O QUE FAZ ISTO NÃO SER VANILLA

✅ Não existe homepage com cards e hero sections  
✅ Não existe “blog feed” tradicional  
✅ A exploração é topológica (campo de nós)  
✅ O conteúdo tem gravidade (descent)  
✅ O aleatório é uma mecânica central (Anvil)  
✅ O Archive é parte do sistema, não um lixo escondido  
✅ Dossier cria profundidade sem inflacionar canon


_______________
**(Canvas/WebGL leve)** — é a escolha certa para ficar _fora do normal_ sem virar um circo.

Aqui vai a **arquitectura de interação** + **especificação técnica** para implementares o **Crucible como campo de nós** (Canvas), com tudo o resto a encaixar.

---

# 1) Crucible Engine (Canvas) — como funciona

## Entidades

Cada item PASSED vira um nó com:

- `id`
    
- `domain` (Movies/Books/Persons/Others)
    
- `title`
    
- `slug`
    
- `level` (II/III/IV)
    
- `category` (Moral Architecture, Initiatory Cinema, etc.)
    
- `tags[]`
    
- `status` (PASSED/REJECTED) _(no Crucible só mostras PASSED)_
    
- `year` (se existir)
    
- `country` (se existir)
    

## Visual mapping

- **tamanho do nó** = Level (IV maior, III médio, II pequeno)
    
- **brilho/halo** = “heat” (derivado do level + recência opcional)
    
- **clusters** = por `category` (cada categoria tem um “centro” invisível)
    
- **linhas** (edges) = afinidade por tags
    
    - ligação só aparece quando “aproximas” ou quando selecionas um nó (para não poluir)
        

---

# 2) Interações-chave (as que fazem “breath taking”)

## Movimento

- **Pan**: arrastar (drag)
    
- **Zoom**: scroll (com “inércia”)
    
- **Inércia**: ao largar o drag, continua um pouco e trava (sensação de massa)
    

## Hover (não “tooltip”)

Hover não mostra dados. Mostra **tensão**:

- o nó ganha halo
    
- as ligações relevantes aparecem (edges temporários)
    
- surge um micro-texto ao lado (2 linhas):
    
    - `TITLE`
        
    - `CATEGORY · LEVEL`
        

## Clique (abre como ritual)

Clique num nó:

- o campo **escurece**
    
- o nó “fica preso” ao centro
    
- abre **overlay** (não navegação) com:
    
    - título
        
    - category/level
        
    - 2 botões: **OPEN REVIEW** / **OPEN DOSSIER(ES)** (se existirem)
        
- `Esc` fecha e devolve o nó ao campo.
    

Isto faz a experiência parecer **um instrumento**, não um site.

---

# 3) Filtros “rúnicos” sem UI vanilla

Em cima do Canvas (overlay minimal):

### Domain sigils

`MOVIES BOOKS PERSONS OTHERS`

### Heat

`II III IV`

### Temper (Category)

Em vez de dropdown: **uma linha scroll horizontal** com as categorias existentes, em texto pequeno.

- clicar: reorganiza clusters
    
- shift+click: múltiplas categorias
    

> Importante: filtro nunca “esconde brutalmente”.  
> Ele **desvanece e desloca** (o mundo reconfigura-se).

---

# 4) Layout do site com Canvas no centro

## Crucible page

- Canvas full-screen (com safe margins)
    
- Barra minimal em cima: logo + sigils
    
- Canto inferior: `?` (atalhos), `Index`, `Archive`
    

## Anvil

- botão único “STRIKE”
    
- animação: breve flash + “teleporte” para um nó aleatório Level III/IV
    
- abre overlay desse nó imediatamente (o utilizador sente “fui escolhido”)
    

---

# 5) Pipeline de dados (para alimentar o Canvas)

Tu já tens `.md` com bloco `CLASSIFICATION`.

### Recomendado

Gerar automaticamente um ficheiro:

- `out/forge_index.json`
    

Com:

- lista de items PASSED
    
- lista de items REJECTED
    
- tags e categories normalizadas
    

**O Canvas lê só esse JSON.**  
Nada de parse no browser.

---

# 6) Dossier (Artigos) — como entra nesta lógica

Cada Dossier tem:

- `dossier_type`
    
- `anchor_slug` (obra-mãe)
    
- `tags[]`
    
- `status` (normalmente herdado do anchor: só existe se anchor PASSED)
    

### No overlay do nó

Mostras:

- “Forged Extensions: 3 dossiers”
    
- botões directos: Character / Moment / Mechanism
    

### Dossier page

Não precisa Canvas.  
É editorial e cirúrgica:

- cabeçalho técnico
    
- texto
    
- link de volta para o nó no Crucible (“Return to Node”)
    

---

# 7) Detalhes que fazem isto “absurdo de bom” sem exagerar

- **constelações** por categoria (centros invisíveis)
    
- **modo “quiet”** (tecla `Q`): desliga edges, fica só nós
    
- **modo “diagnostic”** (tecla `G`): mostra edges + tags (para power user)
    
- **transições com gravidade**: nada salta, tudo pesa
    

Atalhos:

- `A` anvil
    
- `D` dossier random (de anchors III/IV)
    
- `I` index
    
- `R` random PASSED
    
- `?` overlay atalhos
    

---

# 8) Stack recomendada (simples e sólida)

- Next.js
    
- Canvas 2D (primeiro) com física leve (forças simples)  
    _(se mais tarde quiseres WebGL, trocas o render, não a lógica)_
    
- JSON index gerado no build
    
- Markdown para páginas de review e dossier


___________________


 **Estrutura de pastas/ficheiros completa ** (Next.js) para a THE FORGE, já pensada para:

- **Canvas Crucible** (campo de nós)
    
- **Reviews em Markdown** (movies/books/persons/others)
    
- **Dossiers** (artigos “deep cuts”)
    
- **Archive** (rejected)
    
- **Index** (pesquisa/listas frias)
    
- **build pipeline** a partir dos `.md` gerados pelo teu batch
    

Vou assumir **Next.js App Router** (recomendado).

---

# Estrutura do projecto (definitiva)

$the-forge/
├─ package.json
├─ next.config.js
├─ tsconfig.json
├─ postcss.config.js
├─ tailwind.config.js
├─ .env.local                      # (se precisares de algo, ex: site name)
├─ public/
│  ├─ favicon.ico
│  ├─ fonts/                        # (se quiseres self-host fonts)
│  ├─ textures/                     # (opcional: noise, grain subtil)
│  └─ icons/                        # (muito poucos)
│
├─ content/                         # FONTE CANÓNICA (Markdown)
│  ├─ forge/                        # Reviews (PASSED e REJECTED)
│  │  ├─ movies/
│  │  │  ├─ passed/
│  │  │  └─ rejected/
│  │  ├─ books/
│  │  │  ├─ passed/
│  │  │  └─ rejected/
│  │  ├─ persons/
│  │  │  ├─ passed/
│  │  │  └─ rejected/
│  │  └─ others/
│  │     ├─ passed/
│  │     └─ rejected/
│  │
│  ├─ dossiers/                     # ARTIGOS FORJA (incisões)
│  │  ├─ character/
│  │  ├─ moment/
│  │  ├─ mechanism/
│  │  ├─ device/
│  │  └─ failed-structure/
│  │
│  └─ pages/                        # Textos fixos (About, Manifesto, etc.)
│     ├─ furnace.md
│     ├─ about.md
│     ├─ rules.md
│     └─ glossary.md                # opcional
│
├─ data/                            # INDEXES GERADOS (JSON)
│  ├─ forge_index.json              # nós do Crucible (PASSED)
│  ├─ archive_index.json            # rejected (para Archive)
│  ├─ dossier_index.json            # dossiers
│  └─ stats.json                    # contagens, top categorias, etc.
│
├─ scripts/                         # geradores / build steps
│  ├─ build_indexes.py              # lê content/ -> data/*.json
│  ├─ normalize_tags.py             # opcional
│  └─ import_from_out.py            # opcional: move out/ -> content/
│
├─ app/                             # NEXT.JS (UI)
│  ├─ layout.tsx
│  ├─ globals.css
│  ├─ page.tsx                      # THE FURNACE (Home)
│  │
│  ├─ crucible/
│  │  ├─ page.tsx                   # Canvas Crucible (campo de nós)
│  │  └─ components/
│  │     ├─ CrucibleCanvas.tsx      # motor canvas
│  │     ├─ CrucibleHUD.tsx         # sigils/filtros (não vanilla)
│  │     └─ NodeOverlay.tsx         # overlay ao clicar num nó
│  │
│  ├─ anvil/
│  │  └─ page.tsx                   # encounter mode (random)
│  │
│  ├─ index/
│  │  └─ page.tsx                   # listas frias + pesquisa
│  │
│  ├─ archive/
│  │  └─ page.tsx                   # rejected (Slag Wall)
│  │
│  ├─ dossier/
│  │  ├─ page.tsx                   # landing do dossier
│  │  ├─ [slug]/
│  │  │  └─ page.tsx                # render 1 dossier
│  │  └─ components/
│  │     ├─ DossierHeader.tsx
│  │     └─ DossierNav.tsx
│  │
│  ├─ forge/
│  │  ├─ [domain]/                  # movies/books/persons/others
│  │  │  ├─ page.tsx                # landing do domínio (opcional)
│  │  │  └─ [slug]/
│  │  │     └─ page.tsx             # render 1 review md
│  │
│  ├─ about/
│  │  └─ page.tsx                   # manifesto/rules
│  │
│  └─ api/
│     └─ health/route.ts            # opcional (debug)
│
├─ components/
│  ├─ Shell/
│  │  ├─ Header.tsx                 # minimal
│  │  ├─ Footer.tsx                 # minimal
│  │  └─ KeybindsOverlay.tsx        # ? para atalhos
│  ├─ Markdown/
│  │  ├─ MarkdownRenderer.tsx
│  │  └─ mdx.ts                     # se usares MDX
│  └─ UI/
│     ├─ SigilToggle.tsx
│     ├─ HeatPills.tsx
│     └─ TemperRow.tsx
│
├─ lib/
│  ├─ content.ts                    # lê md, parse classification
│  ├─ slugs.ts                      # slugify + normalização
│  ├─ forgeMath.ts                  # afinidade tags, pesos random
│  ├─ random.ts                     # weighted random (anvil)
│  └─ types.ts                      # TypeScript types
│
└─ README.md






# Como o teu batch entra nisto (sem dor)

## Fluxo simples recomendado

1. O teu script gera `.md` para `out/...` (como já tens).
    
2. Um script de importação faz:
    
    - lê `out/**/*.md`
        
    - olha para `DOMAIN` + `FORGE STATUS`
        
    - move para:
        
        - `content/forge/<domain>/<passed|rejected>/...`
            
3. `scripts/build_indexes.py` gera:
    
    - `data/forge_index.json` (só PASSED)
        
    - `data/archive_index.json` (só REJECTED)
        
    - `data/stats.json` (contagens/top categorias)
        
4. O Next.js:
    
    - Crucible lê `data/forge_index.json` (Canvas)
        
    - Archive lê `data/archive_index.json`
        
    - Index usa ambos + filtros
        

---

# Convenções que te poupam bugs

## 1) O “title” nunca depende do nome do ficheiro

Cada `.md` **tem de ter** no bloco CLASSIFICATION:

- `TITLE:` (ou `SUBJECT:`)
    
- `DOMAIN:`
    
- `FORGE STATUS:`
    
- `FORGE LEVEL:`
    
- `CATEGORY:`
    
- `TAGS:`
    

O nome do ficheiro é só armazenamento.

## 2) Slug fixo

No import/build, cria um `slug` sempre igual:

- `the-social-network-2010`
    
- `hannah-arendt`
    
- `vatican-city`
    

Assim o link é estável.


___________________________

**Importador**

ou assumir:

- o teu batch escreve em `out/` (raiz do projecto)
    
- cada `.md` tem um bloco `CLASSIFICATION` com campos tipo `DOMAIN:`, `FORGE STATUS:`, `FORGE LEVEL:`, `CATEGORY:`, `TAGS:`, `TITLE:` (ou `SUBJECT:`)
    

Se algum campo faltar, o script tenta recuperar do filename.

---

## (1) `scripts/import_from_out.py`

> Move/copia os `.md` de `out/**` para `content/forge/<domain>/<passed|rejected>/...`  
> **Sem depender do nome do ficheiro**.

`# scripts/import_from_out.py from __future__ import annotations  import argparse import re import shutil import unicodedata from dataclasses import dataclass from pathlib import Path from typing import Dict, Optional, Tuple  # ---------------------------- # Helpers: slug + parsing # ----------------------------  def slugify(text: str) -> str:     text = text.strip().lower()     text = unicodedata.normalize("NFKD", text)     text = "".join(ch for ch in text if not unicodedata.combining(ch))     text = re.sub(r"[^a-z0-9]+", "-", text)     text = re.sub(r"-{2,}", "-", text).strip("-")     return text or "untitled"  def parse_classification(md_text: str) -> Dict[str, str]:     """     Parses everything after the first 'CLASSIFICATION' marker as key:value lines.     Very forgiving: ignores empty lines and non key:value lines.     """     if "CLASSIFICATION" not in md_text:         return {}      block = md_text.split("CLASSIFICATION", 1)[1]     data: Dict[str, str] = {}      for raw in block.splitlines():         line = raw.strip()         if not line or ":" not in line:             continue         k, v = line.split(":", 1)         key = k.strip().upper()         val = v.strip()         if key and val:             data[key] = val      return data  def normalize_domain(domain: str) -> str:     d = domain.strip().lower()     mapping = {         "movie": "movies",         "movies": "movies",         "film": "movies",         "films": "movies",         "book": "books",         "books": "books",         "person": "persons",         "persons": "persons",         "people": "persons",         "other": "others",         "others": "others",     }     return mapping.get(d, d if d in {"movies", "books", "persons", "others"} else "others")  def normalize_status(status: str) -> str:     s = status.strip().upper()     if "PASS" in s:         return "passed"     if "REJECT" in s:         return "rejected"     return "unknown"  def extract_title(meta: Dict[str, str], fallback_stem: str) -> str:     return (         meta.get("TITLE")         or meta.get("SUBJECT")         or meta.get("NAME")         or fallback_stem     ).strip()  def extract_year(meta: Dict[str, str]) -> Optional[str]:     y = meta.get("YEAR")     if not y:         return None     y = y.strip()     return y if re.fullmatch(r"\d{4}", y) else None  def build_target_filename(title: str, year: Optional[str], src: Path) -> str:     """     Prefer stable slugs. Include year when present.     Keep .md extension.     """     base = slugify(title)     if year:         base = f"{base}-{year}"     return base + src.suffix.lower()  @dataclass class ImportResult:     src: Path     dst: Path     domain: str     status: str     title: str     year: Optional[str]  # ---------------------------- # Importer # ----------------------------  def import_md_files(     out_dir: Path,     content_dir: Path,     mode: str = "copy",  # "copy" or "move" ) -> Tuple[int, int]:     assert mode in {"copy", "move"}      md_files = sorted(out_dir.rglob("*.md"))     if not md_files:         print(f"[import] No .md files found under: {out_dir}")         return (0, 0)      imported = 0     skipped = 0      for src in md_files:         text = src.read_text(encoding="utf-8", errors="ignore")         meta = parse_classification(text)          domain = normalize_domain(meta.get("DOMAIN", src.parent.name))         status = normalize_status(meta.get("FORGE STATUS", ""))          # Only import known statuses; skip unknown to avoid polluting content/         if status not in {"passed", "rejected"}:             skipped += 1             continue          title = extract_title(meta, src.stem)         year = extract_year(meta)          target_name = build_target_filename(title, year, src)         dst = content_dir / "forge" / domain / status / target_name         dst.parent.mkdir(parents=True, exist_ok=True)          # Avoid overwriting silently — if exists, append suffix         if dst.exists():             i = 2             while True:                 candidate = dst.with_name(dst.stem + f"-{i}" + dst.suffix)                 if not candidate.exists():                     dst = candidate                     break                 i += 1          if mode == "copy":             shutil.copy2(src, dst)         else:             shutil.move(str(src), str(dst))          imported += 1      print(f"[import] Imported: {imported} | Skipped (unknown/missing status): {skipped}")     return (imported, skipped)  def main() -> None:     parser = argparse.ArgumentParser(description="Import Forge .md from out/ into content/forge/... folders")     parser.add_argument("--out", default="out", help="Source folder (default: out)")     parser.add_argument("--content", default="content", help="Destination content folder (default: content)")     parser.add_argument("--mode", choices=["copy", "move"], default="copy", help="copy or move files")     args = parser.parse_args()      out_dir = Path(args.out).resolve()     content_dir = Path(args.content).resolve()      if not out_dir.exists():         raise SystemExit(f"[import] out folder not found: {out_dir}")      import_md_files(out_dir=out_dir, content_dir=content_dir, mode=args.mode)  if __name__ == "__main__":     main()`

### Como correr

`python scripts\import_from_out.py --mode copy`

---

## (2) Índices: `forge_index.json` + `archive_index.json` + `stats.json`

### Esquema do `data/forge_index.json` (o que o Canvas consome)

- `generated_at`: ISO datetime
    
- `items[]` (só PASSED), cada um:
    
    - `id` (slug)
        
    - `domain`
        
    - `title`
        
    - `slug`
        
    - `year?`
        
    - `country?`
        
    - `creator?` (director/author)
        
    - `category`
        
    - `level` ("II"|"III"|"IV")
        
    - `tags[]` (normalizadas)
        
    - `sourcePath` (path do `.md` dentro de `content/`)
        
    - `url` (rota do site: `/forge/<domain>/<slug>`)
        
    - `heat` (número, útil para tamanho/brilho)
        
    - `edges[]` (top afinidades por tags: `{to, weight, sharedTags}`)
        

O `archive_index.json` é igual mas só REJECTED, e sem edges (opcional).

---

## `scripts/build_indexes.py`

> Lê `content/forge/**/**/*.md` e gera:

- `data/forge_index.json`
    
- `data/archive_index.json`
    
- `data/stats.json`
    

`# scripts/build_indexes.py from __future__ import annotations  import json import math import re import unicodedata from collections import Counter, defaultdict from dataclasses import dataclass from datetime import datetime, timezone from pathlib import Path from typing import Dict, List, Optional, Tuple  # ---------------------------- # Helpers # ----------------------------  def iso_now() -> str:     return datetime.now(timezone.utc).isoformat(timespec="seconds")  def slugify(text: str) -> str:     text = text.strip().lower()     text = unicodedata.normalize("NFKD", text)     text = "".join(ch for ch in text if not unicodedata.combining(ch))     text = re.sub(r"[^a-z0-9]+", "-", text)     text = re.sub(r"-{2,}", "-", text).strip("-")     return text or "untitled"  def parse_classification(md_text: str) -> Dict[str, str]:     if "CLASSIFICATION" not in md_text:         return {}     block = md_text.split("CLASSIFICATION", 1)[1]     data: Dict[str, str] = {}     for raw in block.splitlines():         line = raw.strip()         if not line or ":" not in line:             continue         k, v = line.split(":", 1)         key = k.strip().upper()         val = v.strip()         if key and val:             data[key] = val     return data  def normalize_domain(domain: str) -> str:     d = (domain or "").strip().lower()     mapping = {         "movie": "movies", "movies": "movies", "film": "movies", "films": "movies",         "book": "books", "books": "books",         "person": "persons", "persons": "persons", "people": "persons",         "other": "others", "others": "others",     }     return mapping.get(d, d if d in {"movies", "books", "persons", "others"} else "others")  def normalize_status(status: str) -> str:     s = (status or "").strip().upper()     if "PASS" in s:         return "PASSED"     if "REJECT" in s:         return "REJECTED"     return "UNKNOWN"  def normalize_level(level: str) -> str:     l = (level or "").strip().upper()     if l in {"I", "II", "III", "IV"}:         return l     # tolerate "Level III", etc.     m = re.search(r"\b(I{1,3}|IV)\b", l)     return m.group(1) if m else "II"  def split_tags(tags: str) -> List[str]:     """     Accepts:       - "a; b; c"       - "a, b, c"       - "a | b | c"     Normalizes to lower-case kebab-like tokens (but keeps words).     """     if not tags:         return []     raw = re.split(r"[;,|]", tags)     cleaned = []     for t in raw:         x = t.strip().lower()         x = re.sub(r"\s+", " ", x)         if x:             cleaned.append(x)     # dedupe preserve order     seen = set()     out = []     for t in cleaned:         if t not in seen:             out.append(t)             seen.add(t)     return out  def level_to_heat(level: str) -> float:     # Controls node size/brightness.     # Keep simple and stable.     return {"IV": 1.00, "III": 0.72, "II": 0.48, "I": 0.32}.get(level, 0.48)  def safe_get_title(meta: Dict[str, str], fallback: str) -> str:     return (meta.get("TITLE") or meta.get("SUBJECT") or meta.get("NAME") or fallback).strip()  def safe_year(meta: Dict[str, str]) -> Optional[int]:     y = (meta.get("YEAR") or "").strip()     return int(y) if re.fullmatch(r"\d{4}", y) else None  def safe_country(meta: Dict[str, str]) -> Optional[str]:     c = (meta.get("COUNTRY") or "").strip()     return c or None  def safe_creator(meta: Dict[str, str]) -> Optional[str]:     # For movies: DIRECTOR. For books: AUTHOR. For persons: n/a. For others: n/a.     return (meta.get("DIRECTOR") or meta.get("AUTHOR") or "").strip() or None  def safe_category(meta: Dict[str, str]) -> str:     return (meta.get("CATEGORY") or meta.get("PRIMARY CATEGORY") or "Unclassified").strip()  def md_to_url(domain: str, slug: str) -> str:     return f"/forge/{domain}/{slug}"  @dataclass class Item:     id: str     domain: str     title: str     slug: str     status: str     level: str     category: str     tags: List[str]     year: Optional[int]     country: Optional[str]     creator: Optional[str]     sourcePath: str     url: str     heat: float  def build_edges(items: List[Item], max_edges_per_item: int = 6) -> Dict[str, List[dict]]:     """     Build lightweight affinity edges by shared tags.     Weight = Jaccard-like overlap, lightly boosted by higher heat.     Only for PASSED items.     """     # index tag -> item ids     tag_map: Dict[str, List[int]] = defaultdict(list)     for i, it in enumerate(items):         for t in it.tags:             tag_map[t].append(i)      edges: Dict[str, List[dict]] = {}      for i, it in enumerate(items):         candidates = Counter()         it_tags = set(it.tags)         if not it_tags:             edges[it.id] = []             continue          # gather candidates via tags         for t in it.tags:             for j in tag_map.get(t, []):                 if j != i:                     candidates[j] += 1          scored = []         for j, shared_count in candidates.items():             other = items[j]             other_tags = set(other.tags)             union = len(it_tags | other_tags)             if union == 0:                 continue             overlap = shared_count / union  # 0..1             # boost by heat (so Level IV connects a little stronger)             score = overlap * (0.85 + 0.15 * (it.heat + other.heat) / 2.0)             if score <= 0:                 continue              shared_tags = sorted(list(it_tags & other_tags))[:8]             scored.append((score, other.id, shared_tags))          scored.sort(reverse=True, key=lambda x: x[0])         edges[it.id] = [             {"to": oid, "weight": round(score, 4), "sharedTags": shared}             for score, oid, shared in scored[:max_edges_per_item]         ]      return edges  def main() -> None:     root = Path(".").resolve()     content_root = root / "content" / "forge"     data_root = root / "data"     data_root.mkdir(parents=True, exist_ok=True)      if not content_root.exists():         raise SystemExit(f"[indexes] content/forge folder not found: {content_root}")      md_files = sorted(content_root.rglob("*.md"))     if not md_files:         raise SystemExit("[indexes] No markdown files found under content/forge/**")      passed: List[Item] = []     rejected: List[Item] = []      # Stats collectors     stats_domain = Counter()     stats_status = Counter()     stats_level = Counter()     stats_category = Counter()     stats_tag = Counter()      for fp in md_files:         text = fp.read_text(encoding="utf-8", errors="ignore")         meta = parse_classification(text)         if not meta:             continue          domain = normalize_domain(meta.get("DOMAIN", fp.parents[2].name if len(fp.parents) >= 3 else "others"))         status = normalize_status(meta.get("FORGE STATUS", ""))         level = normalize_level(meta.get("FORGE LEVEL", "II"))         category = safe_category(meta)         title = safe_get_title(meta, fp.stem)         year = safe_year(meta)         country = safe_country(meta)         creator = safe_creator(meta)          tags = split_tags(meta.get("TAGS", ""))          slug = slugify(f"{title}-{year}" if year else title)         iid = slug  # stable          source_path = fp.as_posix()         url = md_to_url(domain, slug)         heat = level_to_heat(level)          item = Item(             id=iid,             domain=domain,             title=title,             slug=slug,             status=status,             level=level,             category=category,             tags=tags,             year=year,             country=country,             creator=creator,             sourcePath=source_path,             url=url,             heat=heat,         )          # Stats         stats_domain[domain] += 1         stats_status[status] += 1         stats_level[level] += 1         stats_category[category] += 1         for t in tags:             stats_tag[t] += 1          if status == "PASSED":             passed.append(item)         elif status == "REJECTED":             rejected.append(item)      # Build edges only for PASSED     edges = build_edges(passed, max_edges_per_item=6)      forge_index = {         "generated_at": iso_now(),         "count": len(passed),         "items": [             {                 "id": it.id,                 "domain": it.domain,                 "title": it.title,                 "slug": it.slug,                 "year": it.year,                 "country": it.country,                 "creator": it.creator,                 "category": it.category,                 "level": it.level,                 "tags": it.tags,                 "sourcePath": it.sourcePath,                 "url": it.url,                 "heat": it.heat,                 "edges": edges.get(it.id, []),             }             for it in passed         ],     }      archive_index = {         "generated_at": iso_now(),         "count": len(rejected),         "items": [             {                 "id": it.id,                 "domain": it.domain,                 "title": it.title,                 "slug": it.slug,                 "year": it.year,                 "country": it.country,                 "creator": it.creator,                 "category": it.category,                 "level": it.level,                 "tags": it.tags,                 "sourcePath": it.sourcePath,                 "url": it.url,  # you can route rejected to /archive/<slug> later if you want                 "heat": it.heat,             }             for it in rejected         ],     }      stats = {         "generated_at": iso_now(),         "totals": {             "all": len(passed) + len(rejected),             "passed": len(passed),             "rejected": len(rejected),         },         "by_domain": stats_domain,         "by_status": stats_status,         "by_level": stats_level,         "top_categories": stats_category.most_common(25),         "top_tags": stats_tag.most_common(50),     }      # JSON-friendly counters     stats["by_domain"] = dict(stats["by_domain"])     stats["by_status"] = dict(stats["by_status"])     stats["by_level"] = dict(stats["by_level"])      (data_root / "forge_index.json").write_text(json.dumps(forge_index, indent=2, ensure_ascii=False), encoding="utf-8")     (data_root / "archive_index.json").write_text(json.dumps(archive_index, indent=2, ensure_ascii=False), encoding="utf-8")     (data_root / "stats.json").write_text(json.dumps(stats, indent=2, ensure_ascii=False), encoding="utf-8")      print(f"[indexes] PASSED: {len(passed)} -> data/forge_index.json")     print(f"[indexes] REJECTED: {len(rejected)} -> data/archive_index.json")     print(f"[indexes] Stats -> data/stats.json")  if __name__ == "__main__":     main()`

### Como correr

`python scripts\build_indexes.py`

---

# Como isto encaixa no teu workflow (ordem recomendada)

1. Geras `.md` com o teu batch → `out/`
    
2. Importas:
    

`python scripts\import_from_out.py --mode copy`

3. Geras índices:
    

`python scripts\build_indexes.py`

4. O site lê **apenas** `data/forge_index.json` para o Canvas.
    

---

# Extra (muito recomendado): “um comando só”

Se quiseres, depois faço-te um `scripts/pipeline.py` que corre os 2 passos seguidos e valida campos obrigatórios, para não entrarem `.md` “meio partidos”.
