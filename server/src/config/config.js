import dotenv from "dotenv";
dotenv.config();

const config = {
  mongo_uri: process.env.MONGO_URI,
  port: process.env.PORT,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
  imagekit_public_key: process.env.IMAGEKIT_PUBLIC_KEY,
  imagekit_private_key: process.env.IMAGEKIT_PRIVATE_KEY,
  imagekit_url_endpoint: process.env.IMAGEKIT_URL_ENDPOINT,
};

export default config;
