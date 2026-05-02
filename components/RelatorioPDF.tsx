import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
    color: "#0f172a"
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    marginTop: 10
  },

  img2: {
    width: "100%",
    height: 220,
    objectFit: "contain",
    marginBottom: 15
  },

  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20
  },

  card: {
    width: "48%",
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12
  },

  cardTitle: {
    fontSize: 10,
    color: "#64748b"
  },

  cardValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
    color: "#0f172a"
  }
})

export default function RelatorioPDF({ dados, imagens }: any) {

  const { receita, despesa, resultado, margem } = dados

  return (
    <Document>

      {/* CAPA */}
      <Page style={styles.page}>
        <View style={{ marginTop: 120 }}>
          <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 10 }}>
            Relatório de Performance
          </Text>

          <Text style={{ fontSize: 16, marginBottom: 30 }}>
            Gym Analytics
          </Text>

          <Text style={{ fontSize: 12, color: "#64748b" }}>
            Período analisado
          </Text>

          <Text style={{ fontSize: 14, marginBottom: 40 }}>
            {new Date().toLocaleDateString("pt-BR")}
          </Text>

          <Text style={{ fontSize: 10, color: "#94a3b8", marginTop: 200 }}>
            Documento gerado automaticamente pelo sistema Gym Analytics
          </Text>
        </View>
      </Page>

      {/* RESUMO */}
      <Page style={styles.page}>
        <Text style={styles.title}>Visão Geral da Academia</Text>

        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Receita</Text>
            <Text style={styles.cardValue}>R$ {receita}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Despesas</Text>
            <Text style={styles.cardValue}>R$ {despesa}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Resultado</Text>
            <Text style={styles.cardValue}>R$ {resultado}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Margem</Text>
            <Text style={styles.cardValue}>{margem}%</Text>
          </View>
        </View>
      </Page>

      {/* PÁGINA 1 */}
      <Page style={styles.page}>
        <Text style={styles.title}>Receita por Categoria</Text>
        {imagens.receita && <Image style={styles.img2} src={imagens.receita} />}

        <Text style={styles.title}>Evolução de Alunos</Text>
        {imagens.alunos && <Image style={styles.img2} src={imagens.alunos} />}
      </Page>

      {/* PÁGINA 2 */}
      <Page style={styles.page}>
        <Text style={styles.title}>Composição da Receita</Text>
        {imagens.composicao && <Image style={styles.img2} src={imagens.composicao} />}

        <Text style={styles.title}>Churn Mensal</Text>
        {imagens.churn && <Image style={styles.img2} src={imagens.churn} />}
      </Page>

      {/* PÁGINA 3 */}
      <Page style={styles.page}>
        <Text style={styles.title}>Evolução Financeira</Text>
        {imagens.evolucao && <Image style={styles.img2} src={imagens.evolucao} />}

        <Text style={styles.title}>Ticket Médio</Text>
        {imagens.ticket && <Image style={styles.img2} src={imagens.ticket} />}
      </Page>

      {/* PÁGINA 4 */}
      <Page style={styles.page}>
        <Text style={styles.title}>Custos Operacionais</Text>
        {imagens.custos && <Image style={styles.img2} src={imagens.custos} />}

        <Text style={styles.title}>Margem Operacional</Text>
        {imagens.margem && <Image style={styles.img2} src={imagens.margem} />}
      </Page>

      {/* PÁGINA 5 */}
      <Page style={styles.page}>
        <Text style={styles.title}>Heatmap de Receita</Text>
        {imagens.heatReceita && <Image style={styles.img2} src={imagens.heatReceita} />}

        <Text style={styles.title}>Heatmap de Despesas</Text>
        {imagens.heatDespesa && <Image style={styles.img2} src={imagens.heatDespesa} />}
      </Page>

      {/* ANÁLISE */}
      <Page style={styles.page}>
        <Text style={styles.title}>Análise e Insights</Text>

        <Text>
          A empresa apresenta margem de {margem}%.
        </Text>

        <Text>
          Os custos representam {(Number(receita) > 0 ? (Number(despesa) / Number(receita) * 100).toFixed(1) : "0")}% da receita.
        </Text>
      </Page>

    </Document>
  )
}