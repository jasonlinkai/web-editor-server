import express, { Application } from "express";
import cors, { CorsOptions } from "cors";
import fileUpload from "express-fileupload";
import path from "path";
import { v4 } from "uuid";
import fs from "fs";
import AWS from "aws-sdk";
import { GetUploadedImagesS3DataType, PostUploadPageS3DataType, PostUploadS3DataType } from "./typing";
import ServerResponse from "./utils/ServerResponse";

// Set the AWS credentials and region
AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: "us-east-1",
  sslEnabled: false,
  s3ForcePathStyle: true,
});

// Create an S3 object
const s3 = new AWS.S3();

const paths = {
  public: path.join(__dirname, "../", "./public"),
  uploads: path.join(__dirname, "../", "./public", "./uploads"),
  data: path.join(__dirname, "../", "./data"),
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
    app.get("/uploaded-images-s3", (req, res) => {
      const filePath = paths.data + "/images.txt";
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.error("Error reading file:", err);
          return res.status(500).send(err);
        }
        return res.send(
          new ServerResponse<GetUploadedImagesS3DataType>({
            code: 0,
            message: "success",
            data: data.split(",").filter((a) => a),
          })
        );
      });
    });

    app.post("/upload-s3", (req, res) => {
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send("No files were uploaded.");
      }
      const uploadedFile = req.files.file as fileUpload.UploadedFile;
      const ext = uploadedFile.name.split(".")[1];
      const newFileName = v4() + `.${ext}`;
      s3.upload(
        {
          Bucket: "jacky-web-editor",
          Key: newFileName,
          Body: uploadedFile.data,
          Tagging: "public=yes",
        },
        (err, data) => {
          if (err) {
            return res.status(500).send(err);
          } else {
            console.log("File uploaded successfully. Location:", data.Location);
            const filePath = paths.data + "/images.txt";
            fs.appendFile(filePath, `${data.Location},`, (err) => {
              if (err) {
                console.error("Error appending to file:", err);
                return res.status(500).send(err);
              }
              console.log("New text has been appended to", filePath);
            });
            return res.send(
              new ServerResponse<PostUploadS3DataType>({
                code: 0,
                message: "success",
                data: [data.Location],
              })
            );
          }
        }
      );
    });
    

    app.post("/upload-page-s3", (req, res) => {
      const ast = req.body;
      const json = JSON.stringify(req.body);
      s3.upload(
        {
          Bucket: "jacky-web-editor",
          Key: `${ast.uuid}.json`,
          ContentType: 'application/json',
          Body: json,
          Tagging: "public=yes",
        },
        (err, data) => {
          if (err) {
            return res.status(500).send(err);
          } else {
            console.log("File uploaded successfully. Location:", data.Location);
            const filePath = paths.data + "/pages.txt";
            fs.appendFile(filePath, `${data.Location},`, (err) => {
              if (err) {
                console.error("Error appending to file:", err);
                return res.status(500).send(err);
              }
              console.log("New text has been appended to", filePath);
            });
            return res.send(
              new ServerResponse<PostUploadPageS3DataType>({
                code: 0,
                message: "success",
                data: true,
              })
            );
          }
        }
      );
    });
  }
}
