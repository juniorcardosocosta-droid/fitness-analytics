import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#0a162b",
    color: "#fff"
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
    marginBottom: 15
  }
})

export default function RelatorioPDF({ dados, imagens }: any) {

  const { receita, despesa, resultado, margem } = dados

  return (
    <Document>

      {/* CAPA */}
      <Page style={styles.page}>
        <Text style={styles.title}>Relatório Financeiro</Text>
        <Text>Gym Analytics</Text>
      </Page>

      {/* RESUMO */}
      <Page style={styles.page}>
        <Text style={styles.title}>Resumo Executivo</Text>

        <Text>Receita: R$ {receita}</Text>
        <Text>Despesa: R$ {despesa}</Text>
        <Text>Resultado: R$ {resultado}</Text>
        <Text>Margem: {margem}%</Text>
      </Page>

      {/* GRÁFICOS */}
      <Page style={styles.page}>
        <Text style={styles.title}>Análise Gráfica</Text>

        {imagens.receita && <Image style={styles.img} src={imagens.receita} />}
        {imagens.alunos && <Image style={styles.img} src={imagens.alunos} />}
        {imagens.composicao && <Image style={styles.img} src={imagens.composicao} />}
        {imagens.churn && <Image style={styles.img} src={imagens.churn} />}
        {imagens.evolucao && <Image style={styles.img} src={imagens.evolucao} />}
        {imagens.ticket && <Image style={styles.img} src={imagens.ticket} />}
        {imagens.custos && <Image style={styles.img} src={imagens.custos} />}
        {imagens.margem && <Image style={styles.img} src={imagens.margem} />}
        {imagens.heatReceita && <Image style={styles.img} src={imagens.heatReceita} />}
        {imagens.heatDespesa && <Image style={styles.img} src={imagens.heatDespesa} />}
      </Page>

      {/* ANÁLISE */}
      <Page style={styles.page}>
        <Text style={styles.title}>Análise Automática</Text>

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