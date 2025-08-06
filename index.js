require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");
const bodyParser = require("body-parser");

// Basic Configuration
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

let urlDatabase = {};
let counter = 1;

app.post("/api/shorturl", (req, res) => {
  const url = req.body.url;

  // Validar formato de URL
  try {
    const parsedUrl = new URL(url);
    if (!/^https?:/.test(parsedUrl.protocol)) {
      return res.json({ error: "invalid url" });
    }

    // Verificar dominio con DNS
    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) return res.json({ error: "invalid url" });

      const shortUrl = counter++;
      urlDatabase[shortUrl] = url;

      res.json({
        original_url: url,
        short_url: shortUrl,
      });
    });
  } catch {
    res.json({ error: "invalid url" });
  }
});

app.get("/api/shorturl/:short_url", (req, res) => {
  const url = urlDatabase[req.params.short_url];
  if (url) {
    res.redirect(url);
  } else {
    res.json({ error: "No short URL found for the given input" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
