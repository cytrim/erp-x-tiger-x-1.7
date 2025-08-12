/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

export default app;