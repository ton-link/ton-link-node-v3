const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const TonWeb = require("tonweb");
const ton3 = require("ton3");
const { TonhubConnector } = require("ton-x");
require('dotenv').config()

const Address = ton3.Address;
const Builder = ton3.Builder;
const BOC = ton3.BOC;
const Coins = ton3.Coins;

const app = express();
const tonweb = new TonWeb(
  new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC', {apiKey: (process.env).API_KEY})
);
const connector = new TonhubConnector({
  testnet: false,
});

const ORACLE_ADDRESS = (process.env).ORACLE_ADDRESS;

let cache = {};

const parseUri = (bytes) => {
  return new TextDecoder().decode(bytes);
};

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(cors());

app.get("/api/formatAddress", async (req, res) => {
  res.json({
    address: new Address(req.query.address).toString("base64", {
      bounceable: true,
    }),
  });
});

app.get("/api/stake", async (req, res) => {
  const body = new Builder()
    .storeUint(40, 32)
    .storeUint(0, 64)
  .cell();
  const bodyBOC = BOC.toBase64Standard(body);

  res.json({
    boc: bodyBOC,
    wallet: ORACLE_ADDRESS,
  });
});

app.get("/api/pause", async (req, res) => {
  const body = new Builder()
    .storeUint(140, 32)
    .storeUint(0, 64)
  .cell();

  const bodyBOC = BOC.toBase64Standard(body);

  res.json({
    address: ORACLE_ADDRESS,
    boc: bodyBOC,
  });
});

app.get("/api/withdraw", async (req, res) => {
  const body = new Builder().storeUint(170, 32).storeUint(0, 64).cell();

  const bodyBOC = BOC.toBase64Standard(body);

  res.json({
    address: ORACLE_ADDRESS,
    boc: bodyBOC,
  });
});

app.get("/api/cancelPause", async (req, res) => {
  const body = new Builder().storeUint(130, 32).storeUint(0, 64).cell();

  const bodyBOC = BOC.toBase64Standard(body);

  res.json({
    address: ORACLE_ADDRESS,
    boc: bodyBOC,
  });
});

app.get("/api/removeStake", async (req, res) => {
  const body = new Builder().storeUint(150, 32).storeUint(0, 64).cell();

  const bodyBOC = BOC.toBase64Standard(body);

  res.json({
    address: ORACLE_ADDRESS,
    boc: bodyBOC,
  });
});

app.get("/api/getOperator", async (req, res) => {
  if (!req.query.address) {
    return res.json({
      error: "address",
    });
  }

  
    const cell = new TonWeb.boc.Cell();
    cell.bits.writeAddress(new TonWeb.utils.Address(req.query.address));
  try {
    const result = await tonweb.provider.call2(
      ORACLE_ADDRESS,
      "get_info_about_provider",
      [["tvm.Slice", TonWeb.utils.bytesToBase64(await cell.toBoc(false))]]
    );
    if (result.length < 1) {
      return res.json({
        operator: {
          address: req.query.address,
          stake: 0,
        },
      });
    }


    let operator = {};
    const slice = result.beginParse();
    operator.address = slice.loadAddress().toString(true, true, true);
    operator.status = slice.loadUint(2).toNumber();
    operator.time = slice.loadUint(64).toNumber();
    operator.stake = slice.loadCoins().toNumber();
    operator.number_provider = slice.loadUint(64).toNumber();
    operator.reputation = slice.loadUint(64).toNumber();

    res.json({
      operator,
    });
  } catch (e) {
    res.json({
      error: e,
    });
  }
});

app.get("/api/getJobById", async (req, res) => {
  if (!req.query.jobId) {
    return res.json({
      error: "Enter job id!",
    });
  }
  try {
    const jobID = req.query.jobId;
    const result = await tonweb.provider.call2(
      ORACLE_ADDRESS,
      "get_job_by_jobid",
      [["num", jobID]]
    );

    const cell = result;

    let job = {};
    const slice = cell.beginParse();
    job.id = slice.loadUint(64).toNumber();
    job.startedAt = slice.loadUint(64).toNumber();
    job.endedAt = slice.loadUint(64).toNumber();
    job.jobStatus =
      slice.loadUint(1).toNumber() == 1 ? "Completed" : "Not completed";
    const content = slice.loadRef();
    let content_slice = content;
    job.content = {};
    try {
      let link_slice = content_slice.loadRef();
      let how_much = link_slice.loadUint(32).toNumber();
      job.content.count = how_much;
      let url_array = [];
      for (let index = 0; index < how_much; index++) {
        let link_cell = link_slice.loadRef();
        url_array[index] = parseUri(link_cell.array.slice(1));
      }
      job.content.url_array = url_array;
    } catch (error) {
      console.log(error);
    }
    try {
      job.content.result = content_slice.loadUint(64).toNumber() / 10 ** 9;
    } catch (error) {
      job.content.result = 0;
    }
    let address_slice = slice.loadRef();
    let first_address_slice = address_slice.loadRef();
    let second_address_slice = address_slice.loadRef();
    job.node = {};
    job.node.node1 = first_address_slice
      .loadAddress()
      .toString(true, true, true);
    job.node.node2 = first_address_slice
      .loadAddress()
      .toString(true, true, true);
    job.node.node3 = first_address_slice
      .loadAddress()
      .toString(true, true, true);
    job.node.node4 = second_address_slice
      .loadAddress()
      .toString(true, true, true);
    job.node.node5 = second_address_slice
      .loadAddress()
      .toString(true, true, true);

    var req = slice.loadRef();
    job.req = {};
    job.req.address = req.loadAddress().toString(true, true, true);
    job.req.time = req.loadUint(64).toNumber();
    job.req.value = req.loadCoins().toNumber();
    let status_res_slice = slice.loadRef();
    job.status = {};
    job.result = {};
    let status_slice = status_res_slice.loadRef();
    job.status.node1 = status_slice.loadUint(1).toNumber();
    job.status.node2 = status_slice.loadUint(1).toNumber();
    job.status.node3 = status_slice.loadUint(1).toNumber();
    job.status.node4 = status_slice.loadUint(1).toNumber();
    job.status.node5 = status_slice.loadUint(1).toNumber();

    let res_slice = status_res_slice.loadRef();
    job.result.node1 = res_slice.loadUint(64).toNumber() / 10 ** 9;
    job.result.node2 = res_slice.loadUint(64).toNumber() / 10 ** 9;
    job.result.node3 = res_slice.loadUint(64).toNumber() / 10 ** 9;
    job.result.node4 = res_slice.loadUint(64).toNumber() / 10 ** 9;
    job.result.node5 = res_slice.loadUint(64).toNumber() / 10 ** 9;

    res.json({
      result: job,
    });
  } catch (e) {
    res.json({
      error: "Unexpected error",
    });
  }
});

app.get("/api/connectTonhub", async (req, res) => {
  let link = await connector.createNewSession({
    name: "TON Link",
    url: "https://tonlink.xyz",
  });
  res.json({
    link: link.link,
  });

  const session = await connector.awaitSessionReady(link.id, 20 * 60 * 1000);

  if (session.state === "revoked" || session.state === "expired") {
  } else if (session.state === "ready") {
    console.log(session);
    console.log(link);

    const walletConfig = session.wallet;

    const correctConfig = TonhubConnector.verifyWalletConfig(
      link.id,
      walletConfig
    );

    if (correctConfig) {
      let uuid = req.query.uuid;
      cache[uuid] = session.wallet.address;
    }
  } else {
    throw new Error("Impossible");
  }
});

app.get("/api/checkAuth", async (req, res) => {
  if (cache[req.query.uuid]) {
    res.json({
      address: cache[req.query.uuid],
    });
    delete cache[req.query.uuid];
  } else {
    res.json({});
  }
});

const server = http.createServer(app);
server.listen(process.env.PORT || 80);
