import Constants from "expo-constants";

const ENV = Constants.expoConfig?.extra || {};

export const API_BASE_URL = ENV.API_BASE_URL;
export const STOCK_IMAGE = ENV.STOCK_IMAGE;
