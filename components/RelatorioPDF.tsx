import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
    color: "#0f172a"
  },
  title: {
    fontSize: 22,
    marginBottom: 20
  },
  section: {
    marginBottom: 20
  },
  img: {
    width: "100%",
    maxHeight: 180,
    objectFit: "contain",
    marginBottom: 10
  },

  // 🔥 ADICIONA AQUI 👇
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

      {/* GRÁFICOS */}
      {/* GRÁFICO RECEITA */}
{imagens.receita && (
  <Page style={styles.page}>
    <Text style={styles.title}>Receita por Categoria</Text>
    <Image style={styles.img} src={imagens.receita} />
  </Page>
)}

{/* GRÁFICO ALUNOS */}
{imagens.alunos && (
  <Page style={styles.page}>
    <Text style={styles.title}>Evolução de Alunos</Text>
    <Image style={styles.img} src={imagens.alunos} />
  </Page>
)}

{/* COMPOSIÇÃO */}
{imagens.composicao && (
  <Page style={styles.page}>
    <Text style={styles.title}>Composição da Receita</Text>
    <Image style={styles.img} src={imagens.composicao} />
  </Page>
)}

{/* CHURN */}
{imagens.churn && (
  <Page style={styles.page}>
    <Text style={styles.title}>Churn Mensal</Text>
    <Image style={styles.img} src={imagens.churn} />
  </Page>
)}

{/* EVOLUÇÃO FINANCEIRA */}
{imagens.evolucao && (
  <Page style={styles.page}>
    <Text style={styles.title}>Evolução Financeira</Text>
    <Image style={styles.img} src={imagens.evolucao} />
  </Page>
)}

{/* TICKET */}
{imagens.ticket && (
  <Page style={styles.page}>
    <Text style={styles.title}>Ticket Médio</Text>
    <Image style={styles.img} src={imagens.ticket} />
  </Page>
)}

{/* CUSTOS */}
{imagens.custos && (
  <Page style={styles.page}>
    <Text style={styles.title}>Custos Operacionais</Text>
    <Image style={styles.img} src={imagens.custos} />
  </Page>
)}

{/* MARGEM */}
{imagens.margem && (
  <Page style={styles.page}>
    <Text style={styles.title}>Margem Operacional</Text>
    <Image style={styles.img} src={imagens.margem} />
  </Page>
)}

{/* HEATMAP RECEITA */}
{imagens.heatReceita && (
  <Page style={styles.page}>
    <Text style={styles.title}>Heatmap de Receita</Text>
    <Image style={styles.img} src={imagens.heatReceita} />
  </Page>
)}

{/* HEATMAP DESPESA */}
{imagens.heatDespesa && (
  <Page style={styles.page}>
    <Text style={styles.title}>Heatmap de Despesas</Text>
    <Image style={styles.img} src={imagens.heatDespesa} />
  </Page>
)}

      {/* ANÁLISE */}
      <Page style={styles.page}>
        <Text style={styles.title}>Análise e Insights</Text>

        <Text>
          A empresa apresenta margem de {margem}%.
        </Text>

        <Text>
          Os custos representam {(Number(despesa) / Number(receita) * 100).toFixed(1)}% da receita.
        </Text>

      </Page>

    </Document>
  )
}