import * as XLSX from "xlsx";

export async function normalizarCRM(file: File) {

  return new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.onload = (e: any) => {

      try {

        const data = new Uint8Array(
          e.target.result
        );

        const workbook = XLSX.read(data, {
          type: "array"
        });

        const sheet =
          workbook.Sheets[
            workbook.SheetNames[0]
          ];

        const json: any[] =
          XLSX.utils.sheet_to_json(sheet);

        const registros = json.map((row: any) => {

          const lista =
            String(row["LISTA"] || "")
              .trim()
              .toUpperCase();

          let etapa = "CONTATO";

          if (
            lista.includes(
              "AULA EXPERIMENTAL AGENDADA"
            )
          ) {
            etapa = "AGENDADO";
          }

          if (
            lista.includes(
              "RETORNO FECHAMENTO"
            )
          ) {
            etapa = "AULA_EXPERIMENTAL";
          }

          if (
            lista.includes(
              "VENDA FECHADA"
            )
          ) {
            etapa = "FECHADO";
          }

          return {

            nome:
              row["NOME"] || "",

            telefone:
              row["TELEFONE"] || "",

            email:
              row["EMAIL"] || "",

            vendedor:
              row["CONSULTOR"] || "",

            lista,

            etapa,

            data_cadastro:
              row["DATA"] || null

          };

        });

        resolve(registros);

      } catch (error) {

        reject(error);

      }

    };

    reader.readAsArrayBuffer(file);

  });

}