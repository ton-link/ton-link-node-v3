import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import Box from "../components/Box/Box";
import Title from "../components/Title/Title";
import Button from "../components/Button/Button";
import Input from "../components/Input/Input";
import env from "react-dotenv";
import logo from "../assets/img/logo.png";
import QRCode from "react-qr-code";

const AddStake = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState("enterAmount");
  const [amount, setAmount] = useState(30000);
  const [payData, setPayData] = useState({
    link: "",
  });

  return (
    <>
      {page == "enterAmount" && (
        <div class="main">
          <img src={logo} class="logo" />
          <div class="Box Box__center">
            <Title style={{ "margin-bottom": "24px" }} type={2}>
              Add stake
            </Title>

            <Title style={{ "margin-bottom": "24px" }} type={2}>
              For a stake you must send 30 TONs
            </Title>

            <Button
              size={"medium"}
              color={"dark"}
              onClick={async () => {
                let req = await fetch(
                  `${env.API_LINK}/api/stake?amount=30&address=${localStorage.getItem(
                    "address"
                  )}`
                );
                console.log(Number(env.STAKE_AMOUNT) * Math.pow(10, 9))
                const res = await req.json();
                setPayData({
                  link: `ton://transfer/${res.wallet}?bin=${res.boc}&amount=${Number(env.STAKE_AMOUNT) * Math.pow(10, 9)
                  }`,
                });
                setPage("payStake");
              }}
            >
              Next
            </Button>
            <Button
              size={"medium"}
              color={"dark"}
              onClick={() => {
                navigate("/");
              }}
            >
              Back
            </Button>
          </div>
        </div>
      )}
      {page == "payStake" && (
        <div class="main">
          <img src={logo} class="logo" />
          <Box center={true}>
            <Title style={{ "margin-bottom": "24px" }} type={2}>
              Send your stake.
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
            <Button
              size={"medium"}
              color={"dark"}
              onClick={() => {
                setPage("enterAmount");
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

export default AddStake;
