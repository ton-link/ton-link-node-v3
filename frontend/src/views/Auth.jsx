import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import QRCode from "react-qr-code";
import TonConnect from "@tonconnect/sdk";
import { isWalletInfoInjected } from "@tonconnect/sdk";

import Box from "../components/Box/Box";
import Title from "../components/Title/Title";
import Button from "../components/Button/Button";
import env from "react-dotenv";
import logo from "../assets/img/logo.png";
import tonkeeper from "../assets/img/tonkeeper.svg";
import tonhub from "../assets/img/tonhub.svg";
const Auth = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState("selectWallet");
  const [uid, setUid] = useState(Math.floor(Date.now() / 1000));
  const [authData, setAuthData] = useState({});

  useEffect(() => {
    if (localStorage.getItem("address")) {
      navigate("/");
    }
  }, []);

  useEffect(() => {
    async function checkAuth() {
      const req = await fetch(
        `${env.API_LINK}/api/checkAuth?uuid=${uid}`
      );
      const res = await req.json();

      if (res.address) {
        localStorage.setItem("address", res.address);
        window.location.reload();
      }
    }

    if (page == "connectWallet") {
      const interv = setInterval(checkAuth, 1000);

      return () => clearInterval(interv);
    }
  }, [page]);

  const connectTonhub = async () => {
    const req = await fetch(
      `${env.API_LINK}/api/connectTonhub?uuid=${uid}`
    );
    const res = await req.json();

    setAuthData({
      link: res.link,
    });
    setPage("connectWallet");
  };

  const connectTonkeeper = async () => {
    const connector = new TonConnect({
      manifestUrl: "https://tonlink.xyz/tonconnect-manifest.json",
    });
    connector.restoreConnection();

    const walletsList = await TonConnect.getWallets();
    console.log(walletsList);
    const embeddedWallet = walletsList.find(
      (wallet) => isWalletInfoInjected(wallet) && wallet.embedded
    );
    console.log(embeddedWallet);
    if (embeddedWallet) {
      connector.connect({
        jsBridgeKey: embeddedWallet.jsBridgeKey,
      });
    } else {
      const tonkeeperConnectionSource = {
        universalLink: walletsList[0].universalLink,
        bridgeUrl: walletsList[0].bridgeUrl,
      };

      const universalLink = connector.connect(tonkeeperConnectionSource);

      setAuthData({
        link: universalLink,
      });
      setPage("connectWallet");
    }

    connector.onStatusChange((wallet) => {
      console.log(wallet);
      if (!wallet) {
        return;
      }
      localStorage.setItem("address", wallet.account.address);
      window.location.reload();
    });
  };

  return (
    <>
      {page == "selectWallet" && (
        <div class="main">
          <img src={logo} class="logo" />
          <Box center={true}>
            <Title style={{ "margin-bottom": "24px" }}>Log In</Title>

            <Button
              size={"large"}
              color={"dark"}
              icon={tonkeeper}
              onClick={() => {
                connectTonkeeper();
              }}
            >
              Tonkeeper
            </Button>
            <Button
              size={"large"}
              color={"dark"}
              icon={tonhub}
              onClick={() => {
                connectTonhub();
              }}
            >
              Tonhub
            </Button>
          </Box>
        </div>
      )}
      {page == "connectWallet" && (
        <div class="main">
          <img src={logo} class="logo" />
          <Box center={true}>
            <Title style={{ "margin-bottom": "24px" }} type={2}>
              Scan the QR code with your phone camera
            </Title>

            <div class="QRBox">
              <QRCode value={authData.link} />
            </div>

            <Button
              size={"medium"}
              color={"dark"}
              onClick={() => {
                window.open(authData.link);
              }}
            >
              Open wallet
            </Button>
            <Button
              size={"medium"}
              color={"dark"}
              onClick={() => {
                setPage("selectWallet");
              }}
            >
              Back
            </Button>
          </Box>
        </div>
      )}
    </>
  );
};

export default Auth;
