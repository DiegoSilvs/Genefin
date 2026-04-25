-- 1. Modificar tabela linhagens: remover sigla e adicionar numero sequencial
ALTER TABLE linhagens DROP COLUMN IF EXISTS sigla;
ALTER TABLE linhagens ADD COLUMN numero INTEGER;

-- 2. Trigger para garantir que cada linhagem receba um número sequencial por espécie/usuário
CREATE OR REPLACE FUNCTION set_linhagem_numero()
RETURNS TRIGGER AS $$
BEGIN
  SELECT COALESCE(MAX(numero), 0) + 1
  INTO NEW.numero
  FROM linhagens
  WHERE usuario_id = NEW.usuario_id AND especie_id = NEW.especie_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_linhagem_numero ON linhagens;
CREATE TRIGGER trigger_linhagem_numero
BEFORE INSERT ON linhagens
FOR EACH ROW
EXECUTE FUNCTION set_linhagem_numero();

-- 3. Atualizar a função de geração de código de indivíduos (Novo formato: ESP·NNN·SEXO·NNNN)
CREATE OR REPLACE FUNCTION gerar_codigo_individuo(
  p_especie_id UUID,
  p_linhagem_id UUID,
  p_sexo TEXT
) RETURNS TEXT AS $$
DECLARE
  v_sigla_especie TEXT;
  v_numero_linhagem INTEGER;
  v_numero INTEGER;
  v_codigo TEXT;
BEGIN
  SELECT sigla INTO v_sigla_especie FROM especies WHERE id = p_especie_id;
  SELECT numero INTO v_numero_linhagem FROM linhagens WHERE id = p_linhagem_id;

  INSERT INTO sequencias_codigo (especie_id, linhagem_id, sexo, ultimo_numero)
  VALUES (p_especie_id, p_linhagem_id, p_sexo, 1)
  ON CONFLICT (especie_id, linhagem_id, sexo)
  DO UPDATE SET ultimo_numero = sequencias_codigo.ultimo_numero + 1
  RETURNING ultimo_numero INTO v_numero;

  v_codigo := v_sigla_especie || '·' || LPAD(v_numero_linhagem::TEXT, 3, '0') || '·' || p_sexo || '·' || LPAD(v_numero::TEXT, 4, '0');
  RETURN v_codigo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Atualizar a função de geração de código de ninhadas
CREATE OR REPLACE FUNCTION gerar_codigo_ninhada(
  p_especie_id UUID,
  p_linhagem_id UUID
) RETURNS TEXT AS $$
DECLARE
  v_sigla_especie TEXT;
  v_numero_linhagem INTEGER;
  v_ano TEXT;
  v_numero INTEGER;
BEGIN
  SELECT sigla INTO v_sigla_especie FROM especies WHERE id = p_especie_id;
  SELECT numero INTO v_numero_linhagem FROM linhagens WHERE id = p_linhagem_id;
  v_ano := EXTRACT(YEAR FROM NOW())::TEXT;

  SELECT COUNT(*) + 1 INTO v_numero
  FROM ninhadas
  WHERE especie_id = p_especie_id
    AND linhagem_id = p_linhagem_id
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());

  RETURN 'NIN·' || v_sigla_especie || '·' || LPAD(v_numero_linhagem::TEXT, 3, '0') || '·' || v_ano || '·' || LPAD(v_numero::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
