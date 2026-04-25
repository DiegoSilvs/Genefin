-- Limpeza para evitar conflitos (apaga tabelas antigas se existirem)
DROP TABLE IF EXISTS eventos_ninhada CASCADE;
DROP TABLE IF EXISTS individuos CASCADE;
DROP TABLE IF EXISTS ninhadas CASCADE;
DROP TABLE IF EXISTS sequencias_codigo CASCADE;
DROP TABLE IF EXISTS estruturas CASCADE;
DROP TABLE IF EXISTS linhagens CASCADE;
DROP TABLE IF EXISTS especies CASCADE;
DROP TABLE IF EXISTS medicoes_agua CASCADE;
DROP TABLE IF EXISTS lotes_alimento CASCADE;
DROP TABLE IF EXISTS estoque_insumos CASCADE;

-- Limpeza de tabelas da versão anterior (schema.sql antigo)
DROP TABLE IF EXISTS peixes CASCADE;
DROP TABLE IF EXISTS tanques CASCADE;
DROP TABLE IF EXISTS cruzamentos CASCADE;
DROP TABLE IF EXISTS medicoes CASCADE;
DROP TABLE IF EXISTS movimentacoes_tanque CASCADE;
DROP TABLE IF EXISTS especies_config CASCADE;

-- 1. ESPÉCIES
-- Banco de espécies pré-cadastrado (não editável pelo usuário)
CREATE TABLE especies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,               -- ex: "Acará disco"
  nome_cientifico TEXT,             -- ex: "Symphysodon sp."
  sigla TEXT NOT NULL UNIQUE,       -- ex: "DISC" (usado no código automático)
  ph_min DECIMAL(4,2),
  ph_max DECIMAL(4,2),
  temp_min DECIMAL(4,1),
  temp_max DECIMAL(4,1),
  condutividade_min INTEGER,
  condutividade_max INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LINHAGENS
-- Criadas pelo usuário, pertencem a uma espécie
CREATE TABLE linhagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  especie_id UUID REFERENCES especies(id) ON DELETE RESTRICT,
  nome TEXT NOT NULL,               -- ex: "Blue Diamond"
  sigla TEXT NOT NULL,              -- ex: "BDI" (usado no código automático)
  descricao TEXT,
  ativa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, especie_id, sigla)
);

-- 3. ESTRUTURAS (aquários, tanques, baias)
CREATE TABLE estruturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  linhagem_id UUID REFERENCES linhagens(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,               -- ex: "AQ-01"
  tipo TEXT NOT NULL CHECK (tipo IN ('reproducao', 'crescimento', 'quarentena', 'exibicao')),
  capacidade INTEGER,               -- quantidade máxima de peixes
  ativa BOOLEAN DEFAULT TRUE,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SEQUÊNCIAS DE CÓDIGO
-- Controla o número sequencial por espécie + linhagem + sexo
-- Garante que nunca haja duplicidade de código
CREATE TABLE sequencias_codigo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  especie_id UUID REFERENCES especies(id) ON DELETE CASCADE,
  linhagem_id UUID REFERENCES linhagens(id) ON DELETE CASCADE,
  sexo TEXT NOT NULL CHECK (sexo IN ('M', 'F', 'I')), -- I = indefinido
  ultimo_numero INTEGER DEFAULT 0,
  UNIQUE(especie_id, linhagem_id, sexo)
);

-- 5. INDIVÍDUOS (reprodutores e promovidos)
-- Apenas peixes que saíram de ninhada e têm identidade própria
CREATE TABLE individuos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  especie_id UUID REFERENCES especies(id) ON DELETE RESTRICT,
  linhagem_id UUID REFERENCES linhagens(id) ON DELETE RESTRICT,
  estrutura_id UUID REFERENCES estruturas(id) ON DELETE SET NULL,
  ninhada_origem_id UUID,           -- referência à ninhada que originou (FK adicionada depois)
  pai_id UUID REFERENCES individuos(id) ON DELETE SET NULL,
  mae_id UUID REFERENCES individuos(id) ON DELETE SET NULL,

  codigo TEXT NOT NULL UNIQUE,      -- ex: "DISC·BDI·M·0023" (gerado automaticamente)
  nome_popular TEXT,                -- ex: "Zeus" (opcional, apenas referência interna)
  sexo TEXT NOT NULL CHECK (sexo IN ('M', 'F', 'I')),
  geracao INTEGER DEFAULT 1,        -- 1 = fundador, 2 = F1, 3 = F2...
  origem TEXT DEFAULT 'fundador' CHECK (origem IN ('fundador', 'ninhada')),
  data_nascimento DATE,
  data_promocao DATE,               -- quando saiu de ninhada e virou indivíduo
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'morto', 'vendido', 'descartado')),
  fenotipo JSONB DEFAULT '{}',      -- ex: {"cor": "azul intenso", "nadadeira": "longa"}
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. NINHADAS
-- A entidade central — controla lotes sem criar 1000 registros individuais
CREATE TABLE ninhadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  especie_id UUID REFERENCES especies(id) ON DELETE RESTRICT,
  linhagem_id UUID REFERENCES linhagens(id) ON DELETE RESTRICT,
  pai_id UUID REFERENCES individuos(id) ON DELETE SET NULL,
  mae_id UUID REFERENCES individuos(id) ON DELETE SET NULL,
  estrutura_id UUID REFERENCES estruturas(id) ON DELETE SET NULL,  -- onde estão os alevinos

  codigo TEXT NOT NULL UNIQUE,      -- ex: "NIN·DISC·BDI·2026·018"
  data_cruzamento DATE,
  data_nascimento DATE,
  total_nascidos INTEGER DEFAULT 0,
  total_atual INTEGER DEFAULT 0,    -- decrementado a cada seleção/morte
  total_descartado INTEGER DEFAULT 0,
  total_morto INTEGER DEFAULT 0,
  total_promovido INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'finalizada', 'perdida')),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FK circular: individuos.ninhada_origem_id → ninhadas.id
ALTER TABLE individuos
  ADD CONSTRAINT fk_ninhada_origem
  FOREIGN KEY (ninhada_origem_id) REFERENCES ninhadas(id) ON DELETE SET NULL;

-- 7. EVENTOS DE NINHADA
-- Cada seleção, morte ou venda é um evento registrado
CREATE TABLE eventos_ninhada (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ninhada_id UUID REFERENCES ninhadas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('selecao', 'morte', 'venda_lote', 'promocao')),
  quantidade INTEGER NOT NULL,
  total_restante INTEGER NOT NULL,  -- saldo após o evento
  criterio TEXT,                    -- ex: "tamanho abaixo do padrão", "coloração fora"
  data_evento DATE NOT NULL DEFAULT CURRENT_DATE,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. QUALIDADE DA ÁGUA
-- Medições por estrutura com histórico
CREATE TABLE medicoes_agua (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  estrutura_id UUID REFERENCES estruturas(id) ON DELETE CASCADE,
  ph DECIMAL(4,2),
  temperatura DECIMAL(4,1),
  amonia DECIMAL(6,4),             -- NH3 em ppm
  nitrito DECIMAL(6,4),
  nitrato DECIMAL(6,2),
  condutividade INTEGER,            -- µS/cm
  dureza_gh INTEGER,
  data_medicao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. LOTES DE ALIMENTO VIVO
-- Controle de artêmia, infusório, dáfnia etc.
CREATE TABLE lotes_alimento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  estrutura_destino_id UUID REFERENCES estruturas(id) ON DELETE SET NULL,
  ninhada_destino_id UUID REFERENCES ninhadas(id) ON DELETE SET NULL,

  tipo TEXT NOT NULL CHECK (tipo IN ('artemia', 'infusorio', 'dafnia', 'minhoca_branca', 'larva_mosquito', 'outro')),
  codigo TEXT NOT NULL,             -- ex: "ART-2026-041"
  quantidade_insumo DECIMAL(8,2),  -- gramas de cistos, ml de cultura etc.
  unidade TEXT DEFAULT 'g',
  data_inicio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  temperatura_cultivo DECIMAL(4,1),
  janela_uso_inicio TIMESTAMPTZ,   -- calculada automaticamente
  janela_uso_fim TIMESTAMPTZ,      -- calculada automaticamente
  status TEXT DEFAULT 'preparando' CHECK (status IN ('preparando', 'pronto', 'em_uso', 'vencido', 'descartado')),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ESTOQUE DE INSUMOS
-- Ração, cistos de artêmia, medicamentos etc.
CREATE TABLE estoque_insumos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,               -- ex: "Cistos de artêmia San Francisco"
  tipo TEXT NOT NULL CHECK (tipo IN ('cistos_artemia', 'racao', 'sal', 'medicamento', 'condicionador', 'outro')),
  quantidade_atual DECIMAL(10,2),
  unidade TEXT NOT NULL,            -- g, ml, L, unidade
  quantidade_minima DECIMAL(10,2), -- alerta quando atingir
  data_validade DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ÍNDICES para performance
CREATE INDEX idx_individuos_usuario ON individuos(usuario_id);
CREATE INDEX idx_individuos_linhagem ON individuos(linhagem_id);
CREATE INDEX idx_individuos_estrutura ON individuos(estrutura_id);
CREATE INDEX idx_ninhadas_usuario ON ninhadas(usuario_id);
CREATE INDEX idx_ninhadas_linhagem ON ninhadas(linhagem_id);
CREATE INDEX idx_eventos_ninhada ON eventos_ninhada(ninhada_id);
CREATE INDEX idx_medicoes_estrutura ON medicoes_agua(estrutura_id, data_medicao DESC);
CREATE INDEX idx_lotes_usuario ON lotes_alimento(usuario_id, status);

-- ROW LEVEL SECURITY (RLS) — cada usuário vê só seus dados
ALTER TABLE linhagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE estruturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE individuos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ninhadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_ninhada ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicoes_agua ENABLE ROW LEVEL SECURITY;
ALTER TABLE lotes_alimento ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque_insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequencias_codigo ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (criar para cada tabela com usuario_id)
CREATE POLICY "usuario_ve_proprias_linhagens" ON linhagens FOR ALL USING (auth.uid() = usuario_id);
CREATE POLICY "usuario_ve_proprias_estruturas" ON estruturas FOR ALL USING (auth.uid() = usuario_id);
CREATE POLICY "usuario_ve_proprios_individuos" ON individuos FOR ALL USING (auth.uid() = usuario_id);
CREATE POLICY "usuario_ve_proprias_ninhadas" ON ninhadas FOR ALL USING (auth.uid() = usuario_id);
CREATE POLICY "usuario_ve_proprios_eventos_ninhada" ON eventos_ninhada FOR ALL USING (
  EXISTS (SELECT 1 FROM ninhadas WHERE ninhadas.id = eventos_ninhada.ninhada_id AND ninhadas.usuario_id = auth.uid())
);
CREATE POLICY "usuario_ve_proprias_medicoes" ON medicoes_agua FOR ALL USING (auth.uid() = usuario_id);
CREATE POLICY "usuario_ve_proprios_lotes" ON lotes_alimento FOR ALL USING (auth.uid() = usuario_id);
CREATE POLICY "usuario_ve_proprio_estoque" ON estoque_insumos FOR ALL USING (auth.uid() = usuario_id);
CREATE POLICY "usuario_ve_proprias_sequencias" ON sequencias_codigo FOR ALL USING (
  EXISTS (SELECT 1 FROM linhagens WHERE linhagens.id = sequencias_codigo.linhagem_id AND linhagens.usuario_id = auth.uid())
);

-- Espécies são públicas (leitura para todos)
ALTER TABLE especies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "especies_leitura_publica" ON especies FOR SELECT USING (true);

-- 11. FUNÇÕES DE GERAÇÃO DE CÓDIGO E LÓGICA DE NEGÓCIO

-- Função: gera código único para indivíduo
CREATE OR REPLACE FUNCTION gerar_codigo_individuo(
  p_especie_id UUID,
  p_linhagem_id UUID,
  p_sexo TEXT
) RETURNS TEXT AS $$
DECLARE
  v_sigla_especie TEXT;
  v_sigla_linhagem TEXT;
  v_numero INTEGER;
  v_codigo TEXT;
BEGIN
  SELECT sigla INTO v_sigla_especie FROM especies WHERE id = p_especie_id;
  SELECT sigla INTO v_sigla_linhagem FROM linhagens WHERE id = p_linhagem_id;

  -- Incrementa sequência de forma atômica (evita condição de corrida)
  INSERT INTO sequencias_codigo (especie_id, linhagem_id, sexo, ultimo_numero)
  VALUES (p_especie_id, p_linhagem_id, p_sexo, 1)
  ON CONFLICT (especie_id, linhagem_id, sexo)
  DO UPDATE SET ultimo_numero = sequencias_codigo.ultimo_numero + 1
  RETURNING ultimo_numero INTO v_numero;

  v_codigo := v_sigla_especie || '·' || v_sigla_linhagem || '·' || p_sexo || '·' || LPAD(v_numero::TEXT, 4, '0');
  RETURN v_codigo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: gera código único para ninhada
CREATE OR REPLACE FUNCTION gerar_codigo_ninhada(
  p_especie_id UUID,
  p_linhagem_id UUID
) RETURNS TEXT AS $$
DECLARE
  v_sigla_especie TEXT;
  v_sigla_linhagem TEXT;
  v_ano TEXT;
  v_numero INTEGER;
BEGIN
  SELECT sigla INTO v_sigla_especie FROM especies WHERE id = p_especie_id;
  SELECT sigla INTO v_sigla_linhagem FROM linhagens WHERE id = p_linhagem_id;
  v_ano := EXTRACT(YEAR FROM NOW())::TEXT;

  SELECT COUNT(*) + 1 INTO v_numero
  FROM ninhadas
  WHERE especie_id = p_especie_id
    AND linhagem_id = p_linhagem_id
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());

  RETURN 'NIN·' || v_sigla_especie || '·' || v_sigla_linhagem || '·' || v_ano || '·' || LPAD(v_numero::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: calcula geração de um indivíduo com base nos pais
CREATE OR REPLACE FUNCTION calcular_geracao(
  p_pai_id UUID,
  p_mae_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_geracao_pai INTEGER := 1;
  v_geracao_mae INTEGER := 1;
BEGIN
  IF p_pai_id IS NOT NULL THEN
    SELECT geracao INTO v_geracao_pai FROM individuos WHERE id = p_pai_id;
  END IF;
  IF p_mae_id IS NOT NULL THEN
    SELECT geracao INTO v_geracao_mae FROM individuos WHERE id = p_mae_id;
  END IF;
  -- Filho é geração máxima dos pais + 1
  RETURN GREATEST(v_geracao_pai, v_geracao_mae) + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dados Iniciais (Seeds)
INSERT INTO especies (nome, nome_cientifico, sigla, ph_min, ph_max, temp_min, temp_max) VALUES
  ('Acará Disco', 'Symphysodon sp.', 'DISC', 5.5, 7.0, 26.0, 30.0),
  ('Betta', 'Betta splendens', 'BETT', 6.5, 7.5, 24.0, 28.0),
  ('Guppy', 'Poecilia reticulata', 'GUPY', 7.0, 8.5, 22.0, 28.0),
  ('Acará Bandeira', 'Pterophyllum scalare', 'BAND', 6.0, 7.5, 24.0, 30.0)
ON CONFLICT (sigla) DO NOTHING;
