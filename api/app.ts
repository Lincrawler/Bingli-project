import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// 导入路由
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();

// 中间件
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'API endpoint not found' 
  });
});

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;
