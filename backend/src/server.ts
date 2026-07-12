import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { env } from './config/env';

const app = createApp();

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    console.log('Database connected successfully');

    const server = app.listen(env.PORT, () => {
      console.log(`TransitOps API running on port ${env.PORT} [${env.NODE_ENV}]`);
      console.log(`Health check: http://localhost:${env.PORT}/api/v1/health`);
    });

    const gracefulShutdown = async (signal: string): Promise<void> => {
      console.log(`\n${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        await disconnectDatabase();
        console.log('Server closed. Database disconnected.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => {
      void gracefulShutdown('SIGTERM');
    });

    process.on('SIGINT', () => {
      void gracefulShutdown('SIGINT');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

void startServer();
