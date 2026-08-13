import html2pdf from 'html2pdf.js';

interface ExportColumn {
  title: string;
  dataIndex: string;
  render?: (text: any, record: any) => any;
}

export const exportToPDF = (title: string, columns: ExportColumn[], data: any[]) => {
  const tableHtml = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h2 style="text-align: center; margin-bottom: 20px;">${title}</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            ${columns
              .filter(col => col.title !== 'Action' && col.title !== 'Status')
              .map(col => `<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">${col.title}</th>`)
              .join('')}
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              item => `
            <tr>
              ${columns
                .filter(col => col.title !== 'Action' && col.title !== 'Status')
                .map(col => {
                  let val = item[col.dataIndex];
                  if (col.render) {
                    try {
                      const rendered = col.render(val, item);
                      if (typeof rendered === 'string' || typeof rendered === 'number') {
                        val = rendered;
                      } else {
                        // If it's a React element or something else, fall back to the raw value
                        // or try to find a better representation if needed.
                        val = item[col.dataIndex] || '';
                      }
                    } catch (e) {
                      val = item[col.dataIndex] || '';
                    }
                  }
                  return `<td style="border: 1px solid #ddd; padding: 8px;">${val || ''}</td>`;
                })
                .join('')}
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
      <div style="margin-top: 20px; font-size: 8px; text-align: right;">
        Generated on: ${new Date().toLocaleString()}
      </div>
    </div>
  `;

  const element = document.createElement('div');
  element.innerHTML = tableHtml;

  const opt = {
    margin: 0.5,
    filename: `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' as const }
  };

  html2pdf().from(element).set(opt).save();
};
