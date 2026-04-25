-- 11. FUNÇÕES DE GERAÇÃO DE CÓDIGO E LÓGICA DE NEGÓCIO

-- Função: gera código único para indivíduo
-- Formato: SIGLA_ESPECIE·SIGLA_LINHAGEM·SEXO·NNNN
-- Exemplo: DISC·BDI·M·0023
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
-- Formato: NIN·SIGLA_ESPECIE·SIGLA_LINHAGEM·ANO·NNN
-- Exemplo: NIN·DISC·BDI·2026·018
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
