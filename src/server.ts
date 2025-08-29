import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Welcome to otaQku tasks management API');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
