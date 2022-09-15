const puppeteer = require("puppeteer-core");
const { getOptions } = require("./ChromeOptions");

const HOME_URL = "https://login.lg.com.br/login/uberlandiarefrescos";
const APP_URL = "https://prd-pt1.lg.com.br/FrequenciaCoreWeb/home";

async function execute(isDev) {
  console.log("Starting! ---->>>");
  const options = await getOptions(isDev);
  console.log("options --->>", options);
  const browser = await puppeteer.launch(options);

  const page = await browser.newPage();

  console.log("page --->>");
  page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

  await page.goto(HOME_URL);

  await page.waitForSelector("#Login");
  await page.type("#Login", process.env.LG_USERNAME);
  await page.click(".login__botao-continuar");

  await page.waitForSelector("#Senha");
  await page.type("#Senha", process.env.LG_PASSWORD);
  await page.click(".login__botao-continuar");

  await page.waitForSelector(".p-carousel-content");

  await page.evaluate(() => {
    const elements = [...document.querySelectorAll(".lg-aa-iconeLabel")];

    const targetElement = elements.find(
      (e) => e.children[1].innerText === "Autoatendimento Ponto"
    );
    if (targetElement) {
      console.log("---->>>", targetElement.innerText);
      targetElement.click();
    }
  });

  await page.waitForSelector("iframe");

  const cookies = await page.cookies();
  const sessionIdCookie = cookies.find((c) => c.name === "ASP.NET_SessionId");
  const appUrl = `${APP_URL}?sessionId=${sessionIdCookie?.value}&application=4`;
  await page.goto(appUrl);

  await page.waitForSelector(".MuiContainer-root");

  // await page.waitForTimeout(100);

  await page.evaluate(() => {
    const elements = [...document.querySelectorAll("button")];
    const targetElement = elements.find((e) => e.innerText === "Marcar Ponto");

    if (targetElement) {
      console.log("---->>>", targetElement.innerText);
      targetElement.click();
    }
  });

  // await page.waitForTimeout(100);

  const confirmation = await page.evaluate(() => {
    const elements = [...document.querySelectorAll("button")];
    const targetElement = elements.find((e) => e.innerText === "Confirmar");

    if (targetElement) {
      console.log("---->>>", targetElement.innerText);
      // targetElement.click();
      return true;
    }
    return false;
  });

  await browser.close();

  return confirmation;
}

module.exports = execute;
