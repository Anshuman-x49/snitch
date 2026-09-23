import dotenv from "dotenv";
dotenv.config();

const config = {
  mongo_uri: process.env.MONGO_URI,
  port: process.env.PORT,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
};

export default config;
