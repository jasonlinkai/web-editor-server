import express, { Application } from "express";
import cors, { CorsOptions } from "cors";
import fileUpload from "express-fileupload";
import path from "path";
import { v4 } from "uuid";
import fs from "fs";

const paths = {
  public: path.join(__dirname, "../", "./public"),
  uploads: path.join(__dirname, "../", "./public", "./uploads"),
};

export default class Server {
  constructor(app: Application) {
    this.config(app);
    this.register(app);
  }

  private config(app: Application): void {
    const corsOptions: CorsOptions = {
      origin: "http://localhost:3000",
    };

    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(fileUpload());
    app.use("/public", express.static(paths.public));
  }

  private register(app: Application): void {
    app.get("/uploaded-images", (req, res) => {

      const files = fs.readdirSync(paths.uploads);
      const fileNames = files.map(file => {
        return path.basename(file);
      });

      res.send({
        code: 0,
        message: 'success',
        data: fileNames,
      });
    });
    app.post("/upload", (req, res) => {
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send("No files were uploaded.");
      }
      const uploadedFile = req.files.file as fileUpload.UploadedFile;
      const ext = uploadedFile.name.split(".")[1];
      const newFileName = v4() + `.${ext}`;
      const savePath = `${paths.uploads}/${newFileName}`;
      uploadedFile.mv(savePath, (err) => {
        if (err) {
          return res.status(500).send(err);
        }
        res.send({
          code: 0,
          message: 'success',
          data: [newFileName],
        });
      });
    });
  }
}
