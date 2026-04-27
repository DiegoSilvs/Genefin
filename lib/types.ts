// lib/types.ts

export type Especie = {
  id: string
  nome: string
  nome_cientifico: string | null
  codigo: string
  ph_min: number | null
  ph_max: number | null
  temp_min: number | null
  temp_max: number | null
  condutividade_min: number | null
  condutividade_max: number | null
}

export type Linhagem = {
  id: string
  usuario_id: string
  especie_id: string
  nome: string
  numero: number
  descricao: string | null
  ativa: boolean
  especie?: Especie  // joined
}

export type TipoEstrutura = 'reproducao' | 'crescimento' | 'quarentena' | 'exibicao'

export type Estrutura = {
  id: string
  usuario_id: string
  linhagem_id: string | null
  nome: string
  tipo: TipoEstrutura
  capacidade: number | null
  ativa: boolean
  observacoes: string | null
  linhagem?: Linhagem  // joined
}

export type Sexo = 'M' | 'F' | 'I'
export type StatusIndividuo = 'ativo' | 'morto' | 'vendido' | 'descartado'
export type OrigemIndividuo = 'fundador' | 'ninhada'

export type Individuo = {
  id: string
  usuario_id: string
  especie_id: string
  linhagem_id: string
  estrutura_id: string | null
  ninhada_origem_id: string | null
  pai_id: string | null
  mae_id: string | null
  codigo: string
  nome_popular: string | null
  sexo: Sexo
  geracao: number
  origem: OrigemIndividuo
  data_nascimento: string | null
  data_promocao: string | null
  status: StatusIndividuo
  fenotipo: Record<string, string>
  observacoes: string | null
  // joined
  especie?: Especie
  linhagem?: Linhagem
  estrutura?: Estrutura
  pai?: Pick<Individuo, 'id' | 'codigo' | 'nome_popular'>
  mae?: Pick<Individuo, 'id' | 'codigo' | 'nome_popular'>
}

export type StatusNinhada = 'ativa' | 'finalizada' | 'perdida'

export type Ninhada = {
  id: string
  usuario_id: string
  especie_id: string
  linhagem_id: string
  pai_id: string | null
  mae_id: string | null
  estrutura_id: string | null
  codigo: string
  data_cruzamento: string | null
  data_nascimento: string | null
  total_nascidos: number
  total_atual: number
  total_descartado: number
  total_morto: number
  total_promovido: number
  status: StatusNinhada
  observacoes: string | null
  // joined
  especie?: Especie
  linhagem?: Linhagem
  pai?: Pick<Individuo, 'id' | 'codigo' | 'nome_popular'>
  mae?: Pick<Individuo, 'id' | 'codigo' | 'nome_popular'>
  estrutura?: Estrutura
}

export type TipoEvento = 'selecao' | 'morte' | 'venda_lote' | 'promocao'

export type EventoNinhada = {
  id: string
  ninhada_id: string
  tipo: TipoEvento
  quantidade: number
  total_restante: number
  criterio: string | null
  data_evento: string
  observacoes: string | null
}

export type MedicaoAgua = {
  id: string
  usuario_id: string
  estrutura_id: string
  ph: number | null
  temperatura: number | null
  amonia: number | null
  nitrito: number | null
  nitrato: number | null
  condutividade: number | null
  dureza_gh: number | null
  data_medicao: string
  observacoes: string | null
  estrutura?: Estrutura
}

export type TipoAlimento = 'artemia' | 'infusorio' | 'dafnia' | 'minhoca_branca' | 'larva_mosquito' | 'outro'
export type StatusAlimento = 'preparando' | 'pronto' | 'em_uso' | 'vencido' | 'descartado'

export type LoteAlimento = {
  id: string
  usuario_id: string
  estrutura_destino_id: string | null
  ninhada_destino_id: string | null
  tipo: TipoAlimento
  codigo: string
  quantidade_insumo: number | null
  unidade: string
  data_inicio: string
  temperatura_cultivo: number | null
  janela_uso_inicio: string | null
  janela_uso_fim: string | null
  status: StatusAlimento
  observacoes: string | null
}

// Tipo para os alertas do dashboard
export type TipoAlerta = 'selecao_pendente' | 'agua_vencida' | 'agua_fora_faixa' | 'alimento_pronto' | 'alimento_vencendo' | 'estoque_baixo' | 'ninhada_nova'

export type AlertaDashboard = {
  tipo: TipoAlerta
  prioridade: 'alta' | 'media' | 'baixa'
  titulo: string
  descricao: string
  link: string         // rota para navegar ao clicar
  entidade_id: string  // id do aquário, ninhada etc.
}
