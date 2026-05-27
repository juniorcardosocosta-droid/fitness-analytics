import * as XLSX from "xlsx";

export async function normalizarCRM(file: File) {

  return new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.onload = (e: any) => {

      try {

        const data =
          new Uint8Array(
            e.target.result
          );

        const workbook =
          XLSX.read(data, {
            type: "array"
          });

        const sheet =
          workbook.Sheets[
            workbook.SheetNames[0]
          ];

        // LER PLANILHA COMO ARRAY
        const rows =
          XLSX.utils.sheet_to_json(sheet, {
            header: 1
          });

        // PEGAR CABEÇALHOS REAIS
        const headers: any =
          rows[0];

        // PEGAR DADOS
        const dados =
          rows.slice(1);

        // TRANSFORMAR EM OBJETO
        const json =
          dados.map((row: any) => {

            const obj: any = {};

            headers.forEach(
              (header: any, index: number) => {

                obj[String(header).trim()] =
                  row[index];

              }
            );

            return obj;

          });

        const registros =
          json.map((row: any) => {

            const lista =
              String(
                row["LISTA"] || ""
              )
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

            else if (
              lista.includes(
                "RETORNO FECHAMENTO"
              )
            ) {

              etapa =
                "AULA_EXPERIMENTAL";

            }

            else if (
              lista.includes(
                "VENDA FECHADA"
              )
            ) {

              etapa = "FECHADO";

            }

            return {

              nome:
                row["CLIENTE"] || "",

              telefone:
                row["TELEFONE CLIENTE"] || "",

              email:
                row["E-MAIL"] || "",

              vendedor:
                row["CONSULTOR"] || "",

              lista,

              etapa,

              data_cadastro:
                row["CADASTRO"] || null

            };

          });

        resolve(registros);

      }

      catch (error) {

        reject(error);

      }

    };

    reader.readAsArrayBuffer(file);

  });

}