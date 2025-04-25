import puppeteer from "puppeteer";

const startBrowser = async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--disable-setuid-sandbox"],
      ignoreHTTPSErrors: true,
    });
    return browser;
  } catch (error) {
    console.log(" không tạo được: " + error);
  }
  return browser;
};

export default startBrowser;
