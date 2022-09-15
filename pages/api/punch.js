import execute from "./_lib/TimeTracker";

const isDev = !process.env.AWS_REGION;

export default async function handler(req, res) {
  if (req.method != "POST") {
    res.status(400).json({ message: "Method not allowed" });
    return;
  }

  if (req.headers.authorization !== `Bearer ${process.env.API_TOKEN}`) {
    res.status(401).send("Authorization token error");
    return;
  }

  try {
    const success = await execute(isDev);
    if (success) {
      res.status(200).send("Time tracked");
    } else {
      res.status(400).send("Error");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("Error");
  }
}
