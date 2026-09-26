import ImageKit, { toFile } from "@imagekit/nodejs";
import config from "../config/config.js";
import { v4 as uuidv4 } from "uuid";

const client = new ImageKit({
  privateKey: config.imagekit_private_key
});

export const uploadProductImageService = async ({ image }) => {
  try {
    const fileName = `${uuidv4()}-${image.originalname}`;

    const file = await toFile(image.buffer, fileName);

    const result = await client.files.upload({
      file,
      fileName,
      folder: "snitch",
    });
    return result;
  } catch (error) {
    throw error;
  }
};
