import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (_, res) => {
  res.send('Welcome to otaQku tasks management API');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
