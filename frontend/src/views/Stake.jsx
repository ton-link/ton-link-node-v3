import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";

import Box from "../components/Box/Box";
import Title from "../components/Title/Title";
import Button from "../components/Button/Button";
import Input from "../components/Input/Input";
import {STAKE_AMOUNT, ORACLE_ADDRESS} from "../const";
import logo from "../assets/img/logo.png";
import QRCode from "react-qr-code";
import env from "react-dotenv";

const Stake = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState("payStake");
  const [payData, setPayData] = useState({
    link: `ton://transfer/${ORACLE_ADDRESS}?bin=te6cckEBAQEAOgAAbw+KfqUAAAAAAAAAKFBvwjrACAA1IENrXvw3w1o46vLa3zXmKKs/rZOhKcAvIxw+ebUP3hAX14QDeU8BTg==&amount=30`,
  });

  useMemo(() => {
    async function calculateQr() {
      let req = await fetch(
        `${env.API_LINK}/api/stake?amount=30&address=${localStorage.getItem(
          "address"
        )}`
      );
      const res = await req.json();
      setPayData({
        link: `ton://transfer/${res.wallet}?bin=${res.boc}&amount=${Number(STAKE_AMOUNT) * Math.pow(10, 9)
          }`,
      });
      console.log(`ton://transfer/${res.wallet}?bin=${res.boc}&amount=${Number(STAKE_AMOUNT) * Math.pow(10, 9)}`)
    }
    calculateQr()
  })

  useEffect(() => {
    async function fetchData() {
      let req = await fetch(
        `${env.API_LINK}/api/getOperator?address=${localStorage.getItem(
          "address"
        )}`
      );
      const operator = await req.json();

      if (operator?.operator?.stake !== 0 && !operator.error) {
        navigate("/");
      }
    }

    fetchData();
  }, []);
  return (
    <>
      {page == "payStake" && (
        <div class="main">

          <img src={logo} class="logo" />
          <Box center={true}>
            <Title style={{ "margin-bottom": "24px" }} type={2}>
              For a stake you must send 30 TONs
              <br />
              Scan QR code
            </Title>

            <div class="QRBox">
              <QRCode value={payData.link} />
            </div>

            <Button
              size={"medium"}
              color={"dark"}
              onClick={() => {
                navigate("/");
              }}
            >
              Paid
            </Button>
          </Box>
        </div>
      )}
    </>
  );
};

export default Stake;
