import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser'
import sandboxRoutes from "./routes/sandbox.routes.js"
const app = express();


app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.get('/api/sandbox/health', (req, res) => {
  res.status(200).json({ message: 'Hello from the sandbox server!', status: 'ok' });
});

app.use('/api/sandbox', sandboxRoutes)


export default app;
