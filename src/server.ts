import express, { Application, Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import path from "path";

export default class Server {
  constructor(app: Application) {
    this.config(app);
    this.register(app)
  }

  private config(app: Application): void {
    const corsOptions: CorsOptions = {
      origin: "http://localhost:3001"
    };

    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/public', express.static(path.join(__dirname, '../', 'public')));
  }

  private register(app: Application): void {
    app.get('/', (req: Request, res: Response) => {
      res.send('This is a public route!');
  });
  }
}