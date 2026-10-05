const xlsx = require('xlsx');

try {
  const workbook = xlsx.readFile('C:\\Users\\Administrator\\Downloads\\FORMULIR LOWONGAN GURU SMP NEGERI 2 GAMBIRAN – BANYUWANGI (Jawaban).xlsx');
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);
  console.log(JSON.stringify(data.slice(0, 10), null, 2)); // Print first 10 rows
} catch (e) {
  console.error(e);
}
