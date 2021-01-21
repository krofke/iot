const app = require('./src/app');
const port = process.env.PORT || 3000;
const dotenv = require('dotenv');

dotenv.config();

app.listen(port, () => {
  console.log('Aplicação executando na porta ', port);
});